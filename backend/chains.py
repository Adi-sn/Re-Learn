import os
from operator import itemgetter
from typing import IO, Union #Union TBR
from io import BytesIO
import tempfile

from langchain.memory import ConversationBufferMemory
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI

from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs

from sarvamai import SarvamAI

from roleplay_prompts import LESSON_CONFIG
from survey import get_initial_state, process_turn
from dotenv import load_dotenv

load_dotenv()

gemini_api = os.getenv("GOOGLE_API_KEY")

elevenlabs = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"),)
sarvam_api = SarvamAI(api_subscription_key=os.getenv("SARVAM_API_KEY"))
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.7,
    convert_system_message_to_human=True
)

corrector_prompt_template = """
You are an expert language analysis AI. Your task is to analyze a single sentence from a language learner and provide concise, helpful feedback in JSON format.
The user is learning English and their current CEFR level is {cefr_level}. Analyze the following sentence: "{user_input}"

Your response MUST be a valid JSON object with two keys: 'correction' and 'explanation'.
- 'correction': Provide a more natural or grammatically correct version of the sentence. If the sentence is perfect, say "".
- 'explanation': Briefly explain why the change was made or offer a small tip. If no correction was needed, give a compliment.

User input to analyze: "{user_input}"
Your JSON response:
"""

corrector_prompt = ChatPromptTemplate.from_template(corrector_prompt_template)
corrector_chain = corrector_prompt | llm | JsonOutputParser()

def create_lesson_chain(lesson_id: str, cefr_level: str = "A1"):
    if lesson_id not in LESSON_CONFIG:
        raise ValueError("Invalid lesson ID")

    lesson_config = LESSON_CONFIG[lesson_id]
    roleplayer_template = lesson_config["roleplayer_prompt_template"]
    roleplayer_prompt = ChatPromptTemplate.from_template(roleplayer_template)
    roleplayer_chain = roleplayer_prompt | llm | StrOutputParser()

    combined_chain = RunnableParallel(
        feedback=RunnablePassthrough.assign(cefr_level=lambda x: cefr_level) | corrector_chain,
        reply=RunnablePassthrough.assign(cefr_level=lambda x: cefr_level) | roleplayer_chain
    )
    return combined_chain

def audio_input(filepath: str) -> str:
    if filepath is None:
        return ""
    try:
        with open(filepath, "rb") as audio_file:
            response = sarvam_api.speech_to_text.transcribe(
                file=audio_file,
                model="saarika:v2.5",
                language_code="en-IN"
            )
        return response.transcript
    except Exception as e:
        print(f"Error during transcription: {e}")
        return ""

def audio_output(text: str, cefr_level: str = "B2") -> IO[bytes]:
    # Map CEFR level to speech speed (ElevenLabs speed: 0.5 is faster, 1.5 is slower)
    speed_mapping = {
        "A1": 0.7,  # Very slow
        "A2": 0.8,  # Slower
        "B1": 0.9,  # Slightly slower
        "B2": 1.0,  # Normal
        "C1": 1.1,  # Slightly faster
        "C2": 1.2   # Faster
    }
    
    # Default to normal speed if level is not found
    speech_speed = speed_mapping.get(cefr_level, 1.0)

    response = elevenlabs.text_to_speech.stream(
        voice_id="19STyYD15bswVz51nqLf",
        output_format="mp3_22050_32",
        text=text,
        model_id="eleven_multilingual_v2",
        voice_settings=VoiceSettings(
            stability=0.0,
            similarity_boost=1.0,
            style=0.0,
            use_speaker_boost=True,
            speed=speech_speed,
        ),
    )
    #audio_stream = BytesIO()
    #for chunk in response:
    #    if chunk:
    #        audio_stream.write(chunk)
    #audio_stream.seek(0)
    #return audio_stream
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_file:
        for chunk in response:
            if chunk:
                temp_file.write(chunk)
                temp_file_path = temp_file.name
    return temp_file_path



class ConversationManager:
    def __init__(self, lesson_id: str):
        self.lesson_id = lesson_id
        self.survey_state = get_initial_state()
        self.cefr_level = "A1"  # Default level
        self.chain = None
        self.memory = ConversationBufferMemory(return_messages=False)

    async def chat(self, user_input: str):
        if self.survey_state['stage'] != 'complete':
            self.survey_state = process_turn(user_input, self.survey_state)
            if self.survey_state['stage'] == 'complete':
                self.cefr_level = self.survey_state['final_result']['determined_cefr_level']
                self.chain = create_lesson_chain(self.lesson_id, self.cefr_level)
                return {"reply": f"Assessment complete. Your CEFR level is {self.cefr_level}. We can now begin the roleplay. {self.survey_state['bot_message']}"}
            else:
                return {"reply": self.survey_state['bot_message']}
        
        if not self.chain:
            self.chain = create_lesson_chain(self.lesson_id, self.cefr_level)

        loaded_memory = self.memory.load_memory_variables({})
        current_history = loaded_memory.get('history', '')

        response = await self.chain.ainvoke({
            "user_input": user_input,
            "history": current_history
        })

        self.memory.save_context(
            {"input": user_input},
            {"output": response['reply']}
        )
        
        return response