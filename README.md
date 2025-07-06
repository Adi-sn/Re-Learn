# Re-Learn 🗣️✨

An AI-powered conversational language assistant for immersive, scenario-based learning. Re-Learn assesses your language proficiency and places you in real-world role-playing scenarios with an adaptive AI companion to help you practice and improve.

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)

---

##  Key Features

-   **Adaptive CEFR Assessment**: A dynamic, multi-step evaluation to accurately determine a user's English proficiency level (A1 to C2).
-   **AI-Generated Scenarios**: Generates unique role-playing scenarios tailored to the user's assessed language level.
-   **Interactive Voice Role-Play**: Engage in spoken conversations with an AI character, with both text and voice input supported.
-   **Real-Time Feedback**: Get instant, constructive feedback on your responses, including corrections and explanations.
-   **Adaptive Companion**: The AI's language complexity and speech speed adjust dynamically based on the user's CEFR level.
-   **Modern Frontend**: A sleek, responsive, dark-mode interface built with React, Vite, and Tailwind CSS, featuring beautiful animations.
-   **Robust Backend**: Powered by FastAPI and LangChain, orchestrating multiple AI services for a seamless experience.

##  Tech Stack

| Area       | Technology                                                                                                       |
| :--------- | :--------------------------------------------------------------------------------------------------------------- |
| **Backend**  | **Python**, **FastAPI**, **LangChain**, **Google Gemini**, **ElevenLabs** (TTS), **Sarvam AI** (STT), **Uvicorn**      |
| **Frontend** | **React**, **Vite**, **Tailwind CSS**, **Material-UI (MUI)**, **Framer Motion**, **OGL** (WebGL), **Axios**        |

##  Project Structure

The project is organized into two main parts: a `frontend` React application and a `backend` FastAPI server.
```
├── backend/
│ ├── chains.py # Core LangChain logic, prompts, and model integrations.
│ ├── survey.py # Logic for the CEFR assessment.
│ ├── main.py # FastAPI application, API endpoints, and session management.
│ ├── requirements.txt # Backend Python dependencies.
│ └── .env.example # Template for environment variables (you should create this).
└── frontend/
├── src/
│ ├── components/ # Reusable React components (Aurora, BlurText, ClickSpark).
│ ├── pages/ # Main pages for the application (Home, Survey, Login).
│ ├── App.jsx # Main app component with routing.
│ └── main.jsx # Entry point for the React application.
├── package.json # Frontend dependencies and scripts.
└── vite.config.js # Vite configuration with proxy to the backend.
```

##  Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or newer)
-   [Python](https://www.python.org/downloads/) (v3.9 or newer) and `pip`
-   API keys for:
    -   Google Gemini
    -   ElevenLabs
    -   Sarvam AI

### 1. Backend Setup

First, set up and run the FastAPI server.

```bash
# 1. Clone the repository
git clone https://github.com/your-username/adi-sn-re-learn.git
cd adi-sn-re-learn/backend

# 2. Create and activate a virtual environment
python -m venv venv
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# 3. Install Python dependencies
# The requirements.txt is minimal. Install all necessary packages:
pip install fastapi uvicorn python-multipart "langchain>=0.1.0" langchain-google-genai pydantic "elevenlabs>=1.0.0" sarvamai-client python-dotenv "nest-asyncio>=1.0.0"

# 4. Set up environment variables
# Create a .env file in the `backend` directory.
# Add your API keys to the .env file like this:
# GEMINI_API_KEY="your_google_api_key"
# ELEVENLABS_API_KEY="your_elevenlabs_api_key"
# SARVAM_API_KEY="your_sarvam_api_key"

# 5. Run the backend server
uvicorn main:app --reload
The backend server will now be running on http://localhost:8000.
2. Frontend Setup
In a new terminal, set up and run the React client.

# 1. Navigate to the frontend directory
cd ../frontend

# 2. Install npm dependencies
npm install
npm install ogl
npm install -D tailwindcss postcss autoprefixer
npm install framer-motion
npm install react react-dom react-router-dom @mui/material @emotion/react @emotion/styled 

# 3. Run the frontend development server
npm run dev

Bash
The frontend will now be available at http://localhost:5173. The Vite server is configured to automatically proxy API requests to the backend.
🕹️ How It Works
The user journey is designed as a single, continuous experience within the "Demo" page:
Start Assessment: The user navigates to the /survey page (via the "Demo" link), which automatically starts a new session.
Sequential Questions: The AI asks a series of text-based questions, each corresponding to a CEFR level (A1 -> C2).
Holistic Evaluation: After all questions are answered, the backend analyzes the entire transcript to determine a final, accurate CEFR level.
Transition to Role-Play: The UI seamlessly transitions to the role-play stage. The chat history is maintained, and a right-hand panel appears with the AI-generated scenario and feedback sections.
Immersive Voice Interaction: The user can now interact with the AI companion using their voice. The text input is replaced by a microphone button.
Continuous Feedback Loop: With each turn, the user receives an audio reply from the AI, and the feedback panel is updated with live corrections and explanations.

🔮 Future Improvements
User Authentication: Implement the Login/Sign Up functionality.
Database Integration: Store user progress, conversation history, and performance metrics.
Custom Scenarios: Allow users to create or choose their own role-play scenarios.
Performance Dashboard: Create a dashboard for users to track their improvement over time.
Real-life Monitoring: Introduce a mode where the AI can "listen in" on real-world practice conversations (with consent) and provide after-the-fact feedback.
UI/UX Refinements: Further polish the user interface and overall experience.

