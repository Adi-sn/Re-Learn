import uvicorn
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import shutil
import os
import uuid

from chains import ConversationManager, audio_input, audio_output

# This dictionary will act as a simple in-memory session store.
# In a production app, you'd use a more robust solution like Redis.
sessions = {}
STATIC_DIR = "static"
TEMP_DIR = "temp_audio"

os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

app = FastAPI()

# This assumes your React app runs on port 5173. Adjust if needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve generated audio files statically
app.mount(f"/{STATIC_DIR}", StaticFiles(directory=STATIC_DIR), name="static")

def get_convo_manager(session_id: str) -> ConversationManager:
    if session_id not in sessions:
        print(f"Creating new session: {session_id}")
        sessions[session_id] = ConversationManager()
    return sessions[session_id]

@app.post("/api/start_chat")
async def start_chat():
    """Initiates a new conversation session."""
    session_id = str(uuid.uuid4())
    convo_manager = get_convo_manager(session_id)
    initial_message = convo_manager.survey_state['bot_message']
    
    return {
        "session_id": session_id,
        "reply": initial_message,
        "stage": convo_manager.survey_state['stage']
    }

@app.post("/api/chat")
async def chat_endpoint(session_id: str = Form(...), text: str = Form(None), audio: UploadFile = File(None)):
    """Handles a turn in the conversation (text or audio)."""
    convo_manager = get_convo_manager(session_id)
    user_input = ""

    if convo_manager.survey_state['stage'] == 'complete' and audio:
        file_path = os.path.join(TEMP_DIR, f"{uuid.uuid4()}_{audio.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        
        user_input = audio_input(file_path)
        os.remove(file_path)
    elif text is not None:
        user_input = text
    elif convo_manager.survey_state['stage'] == 'welcome':
        user_input = "" # Initial empty message to kick off survey
    else:
        raise HTTPException(status_code=400, detail="No valid input provided.")

    response = await convo_manager.chat(user_input)
    
    ai_text_reply = response.get('reply', "Sorry, an error occurred.")
    stage = convo_manager.survey_state['stage']
    
    audio_url = None
    if stage == 'complete' and ai_text_reply:
        # Generate audio reply and make it accessible via a URL
        temp_audio_path = audio_output(ai_text_reply, convo_manager.cefr_level)
        final_audio_filename = f"{uuid.uuid4()}.mp3"
        final_audio_path = os.path.join(STATIC_DIR, final_audio_filename)
        shutil.move(temp_audio_path, final_audio_path)
        audio_url = f"/{STATIC_DIR}/{final_audio_filename}"

    return {
        "session_id": session_id,
        "reply": ai_text_reply,
        "feedback": response.get('feedback'),
        "cefr_level": convo_manager.cefr_level if stage == 'complete' else None,
        "scenario_description": convo_manager.scenario_description if stage == 'complete' else None,
        "stage": stage,
        "audio_url": audio_url
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)