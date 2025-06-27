# adaptive_chains.py

import os
from operator import itemgetter
from typing import IO, Union, Optional
import tempfile

from langchain.memory import ConversationBufferMemory
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI

from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs

from sarvamai import SarvamAI

from dotenv import load_dotenv

# Import from our separate modules
from adaptive_prompts import get_adaptive_lesson_config, get_corrector_prompt_template, LESSON_SCENARIOS
from adaptive_survey import run_quick_assessment, get_assessment_result_details

load_dotenv()

gemini_api = os.getenv("GOOGLE_API_KEY")

# Initialize external services
elevenlabs = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))
sarvam_api = SarvamAI(api_subscription_key=os.getenv("SARVAM_API_KEY"))

# Initialize LLM
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.7,
    convert_system_message_to_human=True
)

def create_adaptive_lesson_chain(lesson_id: str, cefr_level: str = "B1"):
    """
    Create a lesson chain that adapts to user's proficiency level.
    
    Args:
        lesson_id: ID of the lesson scenario
        cefr_level: User's CEFR proficiency level (A1-C2)
        
    Returns:
        Combined chain for adaptive conversation
    """
    lesson_config = get_adaptive_lesson_config(cefr_level)
    
    if lesson_id not in lesson_config:
        available_lessons = list(lesson_config.keys())
        raise ValueError(f"Invalid lesson ID '{lesson_id}'. Available lessons: {available_lessons}")

    # Create adaptive corrector chain
    corrector_template = get_corrector_prompt_template(cefr_level)
    corrector_prompt = ChatPromptTemplate.from_template(corrector_template)
    corrector_chain = corrector_prompt | llm | JsonOutputParser()

    # Create roleplayer chain
    roleplayer_template = lesson_config[lesson_id]["roleplayer_prompt_template"]
    roleplayer_prompt = ChatPromptTemplate.from_template(roleplayer_template)
    roleplayer_chain = roleplayer_prompt | llm | StrOutputParser()

    # Combine both chains
    combined_chain = RunnableParallel(
        feedback=itemgetter("user_input") | corrector_chain,
        reply=RunnablePassthrough() | roleplayer_chain
    )
    return combined_chain

def audio_input(filepath: str) -> str:
    """
    Convert audio file to text using Sarvam AI.
    
    Args:
        filepath: Path to the audio file
        
    Returns:
        Transcribed text or empty string if error
    """
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

def audio_output(text: str, voice_id: str = "19STyYD15bswVz51nqLf") -> str:
    """
    Convert text to speech using ElevenLabs.
    
    Args:
        text: Text to convert to speech
        voice_id: ElevenLabs voice ID
        
    Returns:
        Path to the generated audio file
    """
    try:
        response = elevenlabs.text_to_speech.stream(
            voice_id=voice_id,
            output_format="mp3_22050_32",
            text=text,
            model_id="eleven_multilingual_v2",
            voice_settings=VoiceSettings(
                stability=0.0,
                similarity_boost=1.0,
                style=0.0,
                use_speaker_boost=True,
                speed=1.0,
            ),
        )
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_file:
            for chunk in response:
                if chunk:
                    temp_file.write(chunk)
            temp_file_path = temp_file.name
        return temp_file_path
    except Exception as e:
        print(f"Error during audio generation: {e}")
        return ""

class AdaptiveConversationManager:
    """
    Manages adaptive conversations that adjust to user's proficiency level.
    """
    
    def __init__(self, lesson_id: str, cefr_level: str = "B1"):
        """
        Initialize the conversation manager.
        
        Args:
            lesson_id: ID of the lesson scenario
            cefr_level: User's CEFR proficiency level
        """
        self.lesson_id = lesson_id
        self.cefr_level = cefr_level
        self.chain = create_adaptive_lesson_chain(lesson_id, cefr_level)
        self.memory = ConversationBufferMemory(return_messages=False)
        
        print(f"AdaptiveConversationManager initialized:")
        print(f"  - Lesson: {lesson_id}")
        print(f"  - CEFR Level: {cefr_level}")
        print(f"  - Scenario: {LESSON_SCENARIOS.get(lesson_id, 'Unknown scenario')}")

    def update_proficiency_level(self, new_cefr_level: str):
        """
        Update the user's proficiency level and recreate the chain.
        
        Args:
            new_cefr_level: New CEFR level (A1-C2)
        """
        old_level = self.cefr_level
        self.cefr_level = new_cefr_level
        self.chain = create_adaptive_lesson_chain(self.lesson_id, new_cefr_level)
        print(f"Proficiency level updated: {old_level} → {new_cefr_level}")

    def change_lesson(self, new_lesson_id: str):
        """
        Change to a different lesson scenario.
        
        Args:
            new_lesson_id: ID of the new lesson scenario
        """
        old_lesson = self.lesson_id
        self.lesson_id = new_lesson_id
        self.chain = create_adaptive_lesson_chain(new_lesson_id, self.cefr_level)
        print(f"Lesson changed: {old_lesson} → {new_lesson_id}")
        print(f"New scenario: {LESSON_SCENARIOS.get(new_lesson_id, 'Unknown scenario')}")

    async def chat(self, user_input: str):
        """
        Process user input and generate adaptive response.
        
        Args:
            user_input: User's message
            
        Returns:
            Dictionary containing 'reply' and 'feedback'
        """
        loaded_memory = self.memory.load_memory_variables({})
        current_history = loaded_memory.get('history', '')

        try:
            response = await self.chain.ainvoke({
                "user_input": user_input,
                "history": current_history
            })

            # Save to memory
            self.memory.save_context(
                {"input": user_input},
                {"output": response['reply']}
            )
            
            return response
        except Exception as e:
            print(f"Error during chat processing: {e}")
            return {
                'reply': "I'm sorry, I encountered an error. Please try again.",
                'feedback': {
                    'correction': '',
                    'explanation': 'There was a technical issue. Please try rephrasing your message.'
                }
            }

    def clear_memory(self):
        """Clear conversation memory."""
        self.memory.clear()
        print("Conversation memory cleared.")

    def get_lesson_info(self):
        """Get information about the current lesson."""
        return {
            'lesson_id': self.lesson_id,
            'scenario_description': LESSON_SCENARIOS.get(self.lesson_id, 'Unknown scenario'),
            'cefr_level': self.cefr_level,
            'available_lessons': list(LESSON_SCENARIOS.keys())
        }

class ProficiencyAwareManager:
    """
    Enhanced manager that can assess and adapt to user proficiency in real-time.
    """
    
    def __init__(self, lesson_id: str, initial_cefr_level: str = "B1"):
        """
        Initialize with assessment capabilities.
        
        Args:
            lesson_id: ID of the lesson scenario
            initial_cefr_level: Initial CEFR level assumption
        """
        self.conversation_manager = AdaptiveConversationManager(lesson_id, initial_cefr_level)
        self.user_responses = []
        self.assessment_threshold = 5  # Number of responses before reassessment
        
    async def chat_with_assessment(self, user_input: str, auto_assess: bool = True):
        """
        Chat with automatic proficiency reassessment.
        
        Args:
            user_input: User's message
            auto_assess: Whether to automatically reassess proficiency
            
        Returns:
            Dictionary with response and assessment info
        """
        # Store user response for potential reassessment
        self.user_responses.append(user_input)
        
        # Get chat response
        response = await self.conversation_manager.chat(user_input)
        
        # Check if we should reassess proficiency
        proficiency_updated = False
        if auto_assess and len(self.user_responses) >= self.assessment_threshold:
            new_level = await self._reassess_proficiency()
            if new_level and new_level != self.conversation_manager.cefr_level:
                self.conversation_manager.update_proficiency_level(new_level)
                proficiency_updated = True
                # Reset response counter
                self.user_responses = []
        
        return {
            **response,
            'proficiency_updated': proficiency_updated,
            'current_level': self.conversation_manager.cefr_level,
            'responses_collected': len(self.user_responses)
        }
    
    async def _reassess_proficiency(self) -> Optional[str]:
        """
        Reassess user proficiency based on recent responses.
        
        Returns:
            New CEFR level or None if assessment failed
        """
        if len(self.user_responses) < 3:
            return None
            
        # Use the last few responses for quick assessment
        # Note: This is a simplified reassessment - in practice, you might want
        # to use a different assessment method for conversational data
        recent_responses = self.user_responses[-3:]
        
        try:
            # For now, we'll use a simple heuristic
            # In production, you might want a specialized conversational assessment
            print(f"Reassessing proficiency based on {len(recent_responses)} recent responses...")
            return None  # Placeholder - implement actual reassessment logic
        except Exception as e:
            print(f"Error during proficiency reassessment: {e}")
            return None

# Utility functions
def get_available_lessons():
    """Get list of available lesson scenarios."""
    return LESSON_SCENARIOS

def create_quick_assessment_manager(user_responses: list) -> Optional[AdaptiveConversationManager]:
    """
    Create a conversation manager based on quick assessment.
    
    Args:
        user_responses: List of user responses to CEFR questions
        
    Returns:
        AdaptiveConversationManager or None if assessment failed
    """
    cefr_level = run_quick_assessment(user_responses)
    if cefr_level:
        return AdaptiveConversationManager("coffee_shop", cefr_level)
    return None