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

const Survey = ({ theme }) => {
  // Chat and session state
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [stage, setStage] = useState('loading'); // loading, welcome, assessment_in_progress, complete
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Roleplay-specific state
  const [cefrLevel, setCefrLevel] = useState('');
  const [scenario, setScenario] = useState('');
  const [correction, setCorrection] = useState('');
  const [explanation, setExplanation] = useState('');
  
  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(new Audio());

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Initial call to start the conversation
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

  const handleResponse = (data) => {
    setMessages(prev => [...prev, { text: data.reply, sender: 'bot' }]);
    setStage(data.stage);
    if (data.stage === 'complete') {
        setCefrLevel(data.cefr_level || '');
        setScenario(data.scenario_description || 'Scenario details will appear here.');
        if (data.feedback && data.feedback.correction) {
            setCorrection(data.feedback.correction);
            setExplanation(data.feedback.explanation);
        } else {
            setCorrection('');
            setExplanation('Great job!');
        }
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
            setMessages(prev => [...prev, { text: '(You sent audio)', sender: 'user' }]);
            
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
             <Box className="w-full max-w-2xl mt-4 flex items-center justify-center">
                <IconButton
                    color={isRecording ? "secondary" : "primary"}
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    disabled={isLoading}
                    sx={{ width: 64, height: 64 }}
                >
                    {isLoading ? <CircularProgress size={32} /> : (isRecording ? <StopIcon sx={{ fontSize: 40 }}/> : <MicIcon sx={{ fontSize: 40 }}/>)}
                </IconButton>
            </Box>
        );
    }
    
    return (
        <Box className="w-full max-w-2xl mt-4 flex items-center">
            <TextField fullWidth variant="outlined" value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                placeholder="Type your answer..." disabled={isLoading || stage === 'loading' || stage === 'error'}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: '"Space Mono", monospace', color: theme === 'dark' ? 'white' : 'black',
                    '& fieldset': { borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)' },
                    '&:hover fieldset': { borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' },
                  },
                }}
            />
            <Button variant="contained" color="primary" onClick={handleSendText} disabled={isLoading || stage === 'loading' || stage === 'error'}
                sx={{ height: '56px', minWidth: '100px', ml: 2, fontFamily: '"Space Mono"' }}
            >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Send"}
            </Button>
        </Box>
    )
  };

  return (
    <div className="font-space-mono min-h-screen flex flex-col bg-white dark:bg-gray-900 text-black dark:text-white overflow-hidden">
      <div className="flex-1 container mx-auto flex flex-col md:flex-row items-start justify-center p-4 pt-20 gap-4">
        <Box className="flex flex-col w-full md:flex-1 h-[85vh]">
            <Typography variant="h4" className="font-space-mono space-mono-bold my-4 text-center">
                {stage === 'complete' ? 'Roleplay Session' : 'Language Assessment'}
            </Typography>
            <Box className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg w-full flex-grow flex flex-col overflow-y-auto">
              {messages.map((message, index) => (
                <Box key={index}
                  className={`my-2 p-3 rounded-lg max-w-[80%] ${message.sender === 'bot' ? 'bg-blue-200 dark:bg-blue-800 self-start' : 'bg-green-200 dark:bg-green-800 self-end'}`}
                  sx={{ fontFamily: '"Space Mono", monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                >
                  {message.text}
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>
            {renderInput()}
        </Box>
        {stage === 'complete' && (
            <Box className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg w-full md:w-80 h-auto md:h-[85vh] mt-4 md:mt-0 flex flex-col shrink-0">
                 <Typography variant="h6" className="font-space-mono space-mono-bold mb-4 border-b pb-2">Session Info</Typography>
                <Box className="mb-4">
                    <Typography variant="overline" display="block" gutterBottom>CEFR Level</Typography>
                    <Typography variant="body1" className="font-space-mono space-mono-bold text-lg">{cefrLevel}</Typography>
                </Box>
                <Box className="mb-4">
                    <Typography variant="overline" display="block" gutterBottom>Scenario</Typography>
                    <Typography variant="body2">{scenario}</Typography>
                </Box>
                 <Typography variant="h6" className="font-space-mono space-mono-bold mt-4 mb-4 border-b pb-2">Live Feedback</Typography>
                <Box className="mb-4">
                    <Typography variant="overline" display="block" gutterBottom>Correction</Typography>
                    <Typography variant="body2" className="text-green-600 dark:text-green-400">{correction || '...'}</Typography>
                </Box>
                <Box className="mb-4">
                    <Typography variant="overline" display="block" gutterBottom>Explanation</Typography>
                    <Typography variant="body2">{explanation || '...'}</Typography>
                </Box>
            </Box>
        )}
      </div>
    </div>
  );
};

export default Survey;