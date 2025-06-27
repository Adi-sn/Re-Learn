# survey.py

import os
from typing import Literal, Dict, Any

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
# CHANGED: Imported from pydantic v2 directly, as recommended by the warning.
from pydantic import BaseModel, Field

# --- Configuration ---
load_dotenv()

if "GOOGLE_API_KEY" not in os.environ:
    raise ValueError("GOOGLE_API_KEY not found in .env file.")

# --- 1. Define the Structured Output (Pydantic Models) ---

class Analysis(BaseModel):
    """The detailed analysis of the user's language skills."""
    grammar_score: int = Field(description="An integer score from 1 (many errors) to 5 (perfect).")
    vocabulary_score: int = Field(description="An integer score from 1 (very limited) to 5 (varied).")
    complexity_score: int = Field(description="An integer score from 1 (very simple) to 5 (compound sentences).")
    coherence_score: int = Field(description="An integer score from 1 (incoherent) to 5 (very clear).")

class AssessmentResult(BaseModel):
    """The final assessment result in a structured format."""
    analysis: Analysis
    feedback_for_user: str = Field(description="A short, encouraging, and constructive feedback sentence to show the user.")
    determined_cefr_level: Literal["A1", "A2", "B1", "B2", "C1", "C2"] = Field(description="A single string: 'A1', 'A2', 'B1', 'B2', 'C1' or 'C2'.")
    assessment_complete: bool = Field(description="A boolean flag, should always be true upon completion.")

# --- 2. Create the LangChain Components ---

model = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.5)
parser = PydanticOutputParser(pydantic_object=AssessmentResult)

EVALUATOR_PROMPT_TEMPLATE = """
You are an expert language proficiency evaluator for the {target_language} language.
Your task is to analyze the user's response and determine their proficiency level according to the CEFR scale (A1, A2, B1, B2, C1, C2). Here A1 denotes the most beginner level and C2 denotes the most advanced level.
You are supposed to make strict evaluations based on the user's response to a specific question about their language skills.

User's Self-Assessed Level: {self_assessed_level}
The question you asked the user was: "{question_asked}"
The user's response is:
---
{user_response}
---

Analyze the user's response based on the following criteria:
1.  **Grammatical Accuracy:** Are there errors in verb conjugation, word order, articles, etc.?
2.  **Vocabulary Range:** Is the vocabulary basic and repetitive, or does it show some variety?
3.  **Sentence Complexity:** Are the sentences very simple (e.g., "I like dog") or do they show some structure (e.g., "I like dogs because they are friendly")?
4.  **Coherence:** Is the message understandable, even if there are errors?

{format_instructions}
"""

prompt = ChatPromptTemplate.from_template(
    template=EVALUATOR_PROMPT_TEMPLATE,
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

evaluator_chain = prompt | model | parser

# --- 3. Define the Assessment Flow & State Management ---

TARGET_LANGUAGE = "English"

def get_initial_state() -> Dict[str, Any]:
    """Returns the initial state for a new conversation."""
    initial_message = f"""Welcome! I'm here to help you practice {TARGET_LANGUAGE}.
To get started, how comfortable do you feel with it? Are you a complete beginner, do you know a few words and phrases, or are you somewhere in the early intermediate stage?"""
    
    return {
        "stage": "self_assessment",
        "target_language": TARGET_LANGUAGE,
        "self_assessed_level": None,
        "final_result": None,
        "bot_message": initial_message
    }

def process_turn(user_input: str, current_state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Processes a single turn of the conversation.
    This is the core logic function, completely decoupled from the UI.
    """
    new_state = current_state.copy()
    
    # --- Stage 1: Self-Assessment ---
    if new_state['stage'] == 'self_assessment':
        new_state['self_assessed_level'] = user_input
        new_state['bot_message'] = f"Great! Let's start with a simple one. How do you say 'friend' in {TARGET_LANGUAGE}?"
        new_state['stage'] = 'guided_question_vocab'

    # --- Stage 2: Guided, Scoped Questions ---
    elif new_state['stage'] == 'guided_question_vocab':
        new_state['bot_message'] = f"Okay, now how would you say 'I am learning' in {TARGET_LANGUAGE}?"
        new_state['stage'] = 'guided_question_grammar'

    elif new_state['stage'] == 'guided_question_grammar':
        new_state['bot_message'] = f"Awesome. Now, try to tell me what you had for breakfast this morning in {TARGET_LANGUAGE}. Don't worry about perfection, just try your best!"
        new_state['stage'] = 'evaluation'

    # --- Stage 3: Open-Ended Conversational Prompt & Evaluation ---
    elif new_state['stage'] == 'evaluation':
        question_asked = f"Tell me what you had for breakfast this morning in {TARGET_LANGUAGE}."
        try:
            assessment_result: AssessmentResult = evaluator_chain.invoke({
                "target_language": new_state['target_language'],
                "self_assessed_level": new_state['self_assessed_level'],
                "question_asked": question_asked,
                "user_response": user_input
            })
            
            new_state['final_result'] = assessment_result.model_dump()
            feedback = assessment_result.feedback_for_user
            level = assessment_result.determined_cefr_level
            
            new_state['bot_message'] = f"""{feedback}
Thanks! That was very helpful. Based on our chat, it looks like we can start with lessons at the {level} level. Ready to begin?
(Assessment is now complete)"""
            new_state['stage'] = 'complete'

        except Exception as e:
            print(f"An error occurred during evaluation: {e}")
            new_state['bot_message'] = f"Sorry, I had a little trouble processing that. Let's try one more time. Please tell me about your breakfast in {TARGET_LANGUAGE}."

    elif new_state['stage'] == 'complete':
        new_state['bot_message'] = "The assessment is complete. You can clear the chat to start a new assessment."

    else:
        new_state['bot_message'] = "An unexpected error occurred in the state machine."
        new_state['stage'] = 'complete'
        
    return new_state