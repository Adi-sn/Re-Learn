# adaptive_survey.py

import os
from typing import Literal, Dict, Any, List, Optional

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

load_dotenv()
gemini_api = os.getenv("GOOGLE_API_KEY")

TARGET_LANGUAGE = "English"

# CEFR Assessment Questions
CEFR_QUESTIONS: List[Dict[str, str]] = [
    {
        "level": "A1",
        "question": "To begin, please introduce yourself. What is your name and where are you from?"
    },
    {
        "level": "A2",
        "question": "Thank you. Now, please describe your favorite season. What is the weather like and what do you enjoy doing during that time?"
    },
    {
        "level": "B1",
        "question": "Next, tell me about a skill you would like to learn in the future. Why do you want to learn it and how would you start?"
    },
    {
        "level": "B2",
        "question": "Let's move to a more detailed topic. What are the most important qualities of a good friend? Please explain your viewpoint with supporting reasons."
    },
    {
        "level": "C1",
        "question": "Now for a complex subject. 'It is more important to be happy than to be successful.' Discuss this statement, presenting arguments for and against."
    },
    {
        "level": "C2",
        "question": "Finally, a question requiring abstract thought. Analyze the relationship between individual freedom and societal responsibility. How should a community balance the rights of a person with the needs of the group?"
    }
]

# Pydantic Models for Assessment
class Analysis(BaseModel):
    """The detailed analysis of the user's language skills based on all answers."""
    grammar_score: int = Field(description="Score 1-5 for grammar (1=many errors, 5=flawless).")
    vocabulary_score: int = Field(description="Score 1-5 for vocabulary (1=limited, 5=wide and precise).")
    complexity_score: int = Field(description="Score 1-5 for sentence complexity (1=simple, 5=varied and complex).")
    coherence_score: int = Field(description="Score 1-5 for coherence (1=unclear, 5=logical and well-structured).")

class AssessmentResult(BaseModel):
    """The final holistic assessment result in a structured format."""
    analysis: Analysis
    threshold_analysis: str = Field(description="A brief explanation of the pass/fail decision, stating the highest CEFR level the user successfully passed and where their proficiency broke down.")
    feedback_for_user: str = Field(description="A holistic, encouraging, and constructive feedback summary based on all their answers.")
    determined_cefr_level: Literal["A1", "A2", "B1", "B2", "C1", "C2"] = Field(description="The final, overall determined CEFR level (A1 to C2) based on the pass/fail threshold analysis.")
    assessment_complete: bool = Field(description="A boolean flag, should always be true upon completion.")

# LLM Setup for Assessment
evaluator_llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.5)
parser = PydanticOutputParser(pydantic_object=AssessmentResult)

EVALUATOR_PROMPT_TEMPLATE = """
You are a strict, impartial, and highly-calibrated CEFR examiner for the English language. Your task is to assign a single, accurate CEFR grade (A1 to C2) by analyzing a user's full transcript.

**Your Evaluation Mandate - The Pass/Fail Threshold:**

1.  **Review Holistically:** Read the entire transcript from A1 to C2. Do not evaluate answers in isolation.
2.  **Define a "Pass":** A user "passes" a level if their response successfully achieves the communicative goal of the question for that level, with language quality that is generally characteristic of that level or higher. Minor errors are acceptable at lower levels.
3.  **Identify the Breaking Point:** Pinpoint the CEFR level where the user's linguistic ability is no longer sufficient to meet the demands of the question. This is their "fail" point. Look for significant degradation in grammar, vocabulary precision, sentence structure, or coherence.
4.  **Assign the Final Grade:** The user's final grade is the **highest level they successfully passed**. For example, a user who passes B1 but fails the B2 task MUST be graded B1. A user who attempts the C1 question with many B2-level errors should be graded B1 or B2, depending on their overall consistency. Do not give credit for simply attempting a high-level question.

**Transcript for Evaluation:**
---
{transcript}
---

Provide the final structured output.

{format_instructions}
"""

assessment_prompt = ChatPromptTemplate.from_template(
    template=EVALUATOR_PROMPT_TEMPLATE,
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

evaluator_chain = assessment_prompt | evaluator_llm | parser

def get_initial_assessment_state() -> Dict[str, Any]:
    """Returns the initial state for a new sequential assessment."""
    initial_message = f"""Welcome to the {TARGET_LANGUAGE} proficiency assessment.
I will ask you a series of {len(CEFR_QUESTIONS)} questions, from beginner (A1) to advanced (C2). Please answer each one to the best of your ability.
This assessment will help me understand your proficiency level and adapt my teaching style accordingly.
Press Enter or send a message to begin."""
    
    return {
        "stage": "welcome",
        "question_index": 0,
        "answers": [],
        "final_result": None,
        "bot_message": initial_message
    }

def process_assessment_turn(user_input: str, current_state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Processes a single turn of the sequential conversation for assessment.
    This is the core logic function, completely decoupled from the UI.
    """
    new_state = current_state.copy()
    stage = new_state.get('stage')

    if stage == 'complete':
        new_state['bot_message'] = "The assessment is complete. You can now start your lesson with adapted difficulty level."
        return new_state

    if stage == 'assessment_in_progress':
        new_state['answers'].append(user_input)

    if new_state['question_index'] < len(CEFR_QUESTIONS):
        question_data = CEFR_QUESTIONS[new_state['question_index']]
        new_state['bot_message'] = f"**Question {new_state['question_index'] + 1}/{len(CEFR_QUESTIONS)} (Level: {question_data['level']})**\n\n{question_data['question']}"
        new_state['question_index'] += 1
        new_state['stage'] = 'assessment_in_progress'
    else:
        new_state['stage'] = 'evaluating'
        new_state['bot_message'] = "Thank you. All questions are complete. Analyzing your responses against the CEFR framework now..."
        
        transcript = ""
        for i, question_data in enumerate(CEFR_QUESTIONS):
            question = question_data['question']
            answer = new_state['answers'][i] if i < len(new_state['answers']) else "(No answer provided)"
            transcript += f"Question (for CEFR Level {question_data['level']}): {question}\nUser's Answer: {answer}\n\n"
        
        try:
            assessment_result: AssessmentResult = evaluator_chain.invoke({
                "transcript": transcript
            })
            
            new_state['final_result'] = assessment_result.model_dump()
            level = assessment_result.determined_cefr_level
            threshold_info = assessment_result.threshold_analysis
            feedback = assessment_result.feedback_for_user
            
            new_state['bot_message'] = f"""**Assessment Complete**

**Final CEFR Grade:** `{level}`

**Examiner's Note:** {threshold_info}

**Overall Feedback:** {feedback}

**Your lessons will now be adapted to your {level} proficiency level.**
"""
            new_state['stage'] = 'complete'

        except Exception as e:
            print(f"An error occurred during evaluation: {e}")
            new_state['bot_message'] = "Sorry, I encountered an error while analyzing your responses. Please try restarting the assessment."
            new_state['stage'] = 'error'
            
    return new_state

def run_quick_assessment(user_responses: List[str]) -> Optional[str]:
    """
    Run a quick assessment and return the CEFR level.
    This can be used to get proficiency level without the full UI flow.
    
    Args:
        user_responses: List of user responses to CEFR questions
        
    Returns:
        CEFR level string (A1-C2) or None if error
    """
    if len(user_responses) != len(CEFR_QUESTIONS):
        print(f"Error: Expected {len(CEFR_QUESTIONS)} responses, got {len(user_responses)}")
        return None
        
    transcript = ""
    for i, question_data in enumerate(CEFR_QUESTIONS):
        question = question_data['question']
        answer = user_responses[i]
        transcript += f"Question (for CEFR Level {question_data['level']}): {question}\nUser's Answer: {answer}\n\n"
    
    try:
        assessment_result: AssessmentResult = evaluator_chain.invoke({
            "transcript": transcript
        })
        return assessment_result.determined_cefr_level
    except Exception as e:
        print(f"Error during quick assessment: {e}")
        return None

def get_assessment_result_details(user_responses: List[str]) -> Optional[Dict[str, Any]]:
    """
    Run a complete assessment and return detailed results.
    
    Args:
        user_responses: List of user responses to CEFR questions
        
    Returns:
        Complete assessment result dictionary or None if error
    """
    if len(user_responses) != len(CEFR_QUESTIONS):
        print(f"Error: Expected {len(CEFR_QUESTIONS)} responses, got {len(user_responses)}")
        return None
        
    transcript = ""
    for i, question_data in enumerate(CEFR_QUESTIONS):
        question = question_data['question']
        answer = user_responses[i]
        transcript += f"Question (for CEFR Level {question_data['level']}): {question}\nUser's Answer: {answer}\n\n"
    
    try:
        assessment_result: AssessmentResult = evaluator_chain.invoke({
            "transcript": transcript
        })
        return assessment_result.model_dump()
    except Exception as e:
        print(f"Error during detailed assessment: {e}")
        return None