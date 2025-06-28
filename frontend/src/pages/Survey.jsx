import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import CircularProgress from '@mui/material/CircularProgress';

// Helper component to render simple markdown (bold text)
const FormattedMessage = ({ text }) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </>
  );
};

// DESIGN CHANGE: Reusable component for the info panel to match the new screenshot
const InfoSection = ({ label, value, valueColor = 'text-white' }) => (
  <Box className="mb-6">
    <Typography variant="overline" display="block" gutterBottom className="text-gray-400" sx={{ lineHeight: 1.5 }}>
      {label}
    </Typography>
    <Typography variant="body1" className={`${valueColor} font-space-mono`}>
      {value || '...'}
    </Typography>
  </Box>
);


const Survey = () => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [stage, setStage] = useState('loading');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cefrLevel, setCefrLevel] = useState('');
  const [scenario, setScenario] = useState('');
  const [correction, setCorrection] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(new Audio());
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    const startChat = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post('/api/start_chat');
        const { session_id, reply, stage: newStage } = response.data;
        setSessionId(session_id);
        setMessages([{ text: reply, sender: 'bot' }]);
        setStage(newStage);
      } catch (error) {
        console.error('Error starting chat:', error);
        setMessages([{ text: 'Failed to connect to the server. Please refresh the page.', sender: 'bot' }]);
        setStage('error');
      } finally {
        setIsLoading(false);
      }
    };
    startChat();
  }, []);

  const playAudio = (audioUrl) => {
      if (audioUrl) {
          const audioPlayer = audioPlayerRef.current;
          audioPlayer.src = audioUrl;
          audioPlayer.play().catch(e => console.error("Audio play failed:", e));
      }
  };

  // --- BUG FIX: This logic is now more robust ---
  const handleResponse = (data) => {
    // Always add the new bot message
    setMessages(prev => [...prev, { text: data.reply, sender: 'bot' }]);
    
    // If the stage is changing to 'complete' for the first time
    if (data.stage === 'complete' && stage !== 'complete') {
        setCefrLevel(data.cefr_level || '');
        setScenario(data.scenario_description || 'Scenario details will appear here.');
        // Set initial state for the feedback panel
        setCorrection('');
        setExplanation('Your live feedback will appear here.');
    }
    // If we are already in the 'complete' stage (i.e., a subsequent roleplay turn)
    else if (data.stage === 'complete') {
        if (data.feedback) {
            // Update with new feedback from the backend
            setCorrection(data.feedback.correction);
            setExplanation(data.feedback.explanation);
        }
    }
    
    // Update stage at the end to correctly track transitions
    setStage(data.stage);
    
    if (data.audio_url) {
        playAudio(data.audio_url);
    }
  };


  const submitData = async (formData) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/chat', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      handleResponse(response.data);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorText = error.response?.data?.detail || 'An error occurred. Please try again.';
      setMessages(prev => [...prev, { text: errorText, sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendText = async () => {
    if (inputValue.trim() && sessionId && !isLoading) {
      const userMessage = { text: inputValue, sender: 'user' };
      setMessages(prev => [...prev, userMessage]);
      const textToSend = inputValue;
      setInputValue('');
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('text', textToSend);
      await submitData(formData);
    }
  };

  const handleStartRecording = async () => {
    if (isRecording || isLoading) return;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };
        recorder.onstop = async () => {
            stream.getTracks().forEach(track => track.stop());
            const mimeType = mediaRecorderRef.current.mimeType || 'audio/webm';
            const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
            if (audioBlob.size === 0) {
                console.error("Recorded audio blob is empty.");
                setIsLoading(false);
                return;
            }
            const audioFile = new File([audioBlob], "recording.webm", { type: mimeType });
            setMessages(prev => [...prev, { text: '(Your voice input)', sender: 'user' }]);
            const formData = new FormData();
            formData.append('session_id', sessionId);
            formData.append('audio', audioFile);
            await submitData(formData);
        };
        recorder.start();
        setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setMessages(prev => [...prev, { text: 'Could not access microphone. Please check permissions.', sender: 'bot' }]);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const renderInput = () => {
    if (stage === 'complete') {
      return (
        <Box className="w-full max-w-4xl mt-4 flex items-center justify-center">
          <IconButton
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isLoading}
            sx={{
              width: 72, height: 72,
              bgcolor: isRecording ? '#ef4444' : '#38bdf8', color: 'white',
              '&:hover': { bgcolor: isRecording ? '#dc2626' : '#0ea5e9' }
            }}
          >
            {isLoading ? <CircularProgress size={36} color="inherit" /> : (isRecording ? <StopIcon sx={{ fontSize: 48 }} /> : <MicIcon sx={{ fontSize: 48 }} />)}
          </IconButton>
        </Box>
      );
    }
    return (
      <Box className="w-full max-w-4xl mt-4 flex items-center">
        <TextField fullWidth variant="outlined" value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
          placeholder="Type your answer..." disabled={isLoading || stage === 'loading' || stage === 'error'}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontFamily: '"Space Mono", monospace', color: 'white', backgroundColor: '#1f2937',
              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
              '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
              '&.Mui-focused fieldset': { borderColor: '#38bdf8' },
            },
          }}
        />
        <Button variant="contained" onClick={handleSendText} disabled={isLoading || stage === 'loading' || stage === 'error'}
          sx={{
            height: '56px', minWidth: '100px', ml: 2, fontFamily: '"Space Mono"', bgcolor: '#38bdf8',
            color: 'black', fontWeight: 'bold', '&:hover': { bgcolor: '#0ea5e9' }
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Send"}
        </Button>
      </Box>
    );
  };

  return (
    <div className="font-space-mono min-h-screen flex flex-col bg-black text-white overflow-hidden">
      <div className="flex-1 container mx-auto flex flex-col md:flex-row items-start justify-center p-4 pt-20 gap-6">
        <Box className="flex flex-col w-full md:flex-1 h-[85vh]">
          <Typography variant="h4" className="space-mono-bold mb-4 text-center" sx={{ fontFamily: '"Space Mono", monospace' }}>
            {stage === 'complete' ? 'Roleplay Session' : 'Language Assessment'}
          </Typography>
          <Box className="bg-transparent border border-gray-700 p-4 rounded-lg w-full flex-grow flex flex-col overflow-y-auto">
            {messages.map((message, index) => (
              <Box key={index}
                className={`my-2 p-4 rounded-lg max-w-[85%] ${message.sender === 'bot' ? 'bg-gray-800 self-start' : 'bg-sky-900 self-end'}`}
                sx={{ fontFamily: '"Space Mono", monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              >
                <FormattedMessage text={message.text} />
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
          <div className="flex justify-center w-full">{renderInput()}</div>
        </Box>
        {stage === 'complete' && (
           // --- DESIGN CHANGE: This whole panel is updated to match the screenshot ---
          <Box className="bg-transparent border border-gray-700 p-8 rounded-lg w-full md:w-96 h-auto md:h-[85vh] mt-4 md:mt-0 flex flex-col shrink-0">
            <Typography variant="h5" component="h2" className="mb-4 pb-2 border-b border-gray-700" sx={{ fontWeight: 600 }}>
              Session Info
            </Typography>
            <InfoSection label="CEFR Level" value={cefrLevel} valueColor="text-sky-400" />
            <InfoSection label="Scenario" value={scenario} />
            
            <Typography variant="h5" component="h2" className="mt-4 mb-4 pb-2 border-b border-gray-700" sx={{ fontWeight: 600 }}>
              Live Feedback
            </Typography>
            <InfoSection label="Correction" value={correction} valueColor="text-green-400" />
            <InfoSection label="Explanation" value={explanation} />
          </Box>
        )}
      </div>
    </div>
  );
};

export default Survey;