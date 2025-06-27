// src/pages/DemoPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Paper,
  Chip,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import ClearIcon from '@mui/icons-material/Clear';

// Animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const recording = keyframes`
  0%, 100% { background-color: #f44336; }
  50% { background-color: #ff8a80; }
`;

// Styled Components
const DemoContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(12),
  paddingBottom: theme.spacing(4),
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
}));

const LessonCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
}));

const RecordButton = styled(IconButton)(({ theme, isRecording }) => ({
  width: '80px',
  height: '80px',
  backgroundColor: isRecording ? '#f44336' : '#4caf50',
  color: 'white',
  '&:hover': {
    backgroundColor: isRecording ? '#c62828' : '#388e3c',
  },
  animation: isRecording ? `${recording} 1s infinite` : 'none',
  transition: 'all 0.3s ease',
}));

const ChatMessage = styled(Paper)(({ theme, isUser }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(1, 0),
  maxWidth: '70%',
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  backgroundColor: isUser 
    ? theme.palette.primary.main 
    : theme.palette.background.paper,
  color: isUser ? 'white' : theme.palette.text.primary,
  borderRadius: isUser ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
  animation: `${pulse} 0.3s ease-out`,
}));

const FeedbackCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: '12px',
  border: `2px solid ${theme.palette.success.light}`,
  background: 'linear-gradient(45deg, #e8f5e8 0%, #f1f8e9 100%)',
}));

// Lesson configurations
const LESSON_CONFIG = {
  coffee_shop: {
    title: "Coffee Shop Order",
    description: "Practice ordering coffee and pastries at a busy café",
    scenario: "You're a customer at a Philadelphia coffee shop",
  },
  hotel_check_in: {
    title: "Hotel Check-in",
    description: "Learn hotel check-in procedures and requests",
    scenario: "You're checking into a luxury hotel in Chicago",
  },
};

export default function DemoPage() {
  const navigate = useNavigate();
  const [selectedLesson, setSelectedLesson] = useState('coffee_shop');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendAudioToBackend(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError('');
    } catch (err) {
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToBackend = async (audioBlob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('lesson_id', selectedLesson);
      formData.append('conversation_history', JSON.stringify(conversation));

      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      // Add user message and AI response to conversation
      setConversation(prev => [
        ...prev,
        { role: 'user', content: data.user_text },
        { role: 'assistant', content: data.ai_response }
      ]);

      // Set feedback
      setFeedback(data.feedback);

      // Play AI audio response
      if (data.audio_url) {
        const audio = new Audio(data.audio_url);
        audioRef.current = audio;
        audio.play();
        setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
      }

    } catch (err) {
      setError('Failed to process audio. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setConversation([]);
    setFeedback(null);
    setError('');
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <Box>
      <AppBar position="fixed" sx={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)' }}>
        <Toolbar>
          <IconButton onClick={() => navigate('/')} sx={{ color: 'primary.main' }}>
            <HomeIcon />
          </IconButton>
          <SchoolIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            Re-Learn Demo
          </Typography>
        </Toolbar>
      </AppBar>

      <DemoContainer maxWidth="lg">
        <Typography 
          variant="h3" 
          align="center" 
          gutterBottom
          sx={{ 
            fontFamily: '"Playfair Display", serif',
            fontWeight: 700,
            color: '#2c3e50',
            mb: 4 
          }}
        >
          Interactive Language Demo
        </Typography>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* Left Column - Lesson Selection & Controls */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <LessonCard>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Choose Your Scenario
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Lesson</InputLabel>
                  <Select
                    value={selectedLesson}
                    label="Lesson"
                    onChange={(e) => setSelectedLesson(e.target.value)}
                  >
                    {Object.entries(LESSON_CONFIG).map(([key, config]) => (
                      <MenuItem key={key} value={key}>
                        {config.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {LESSON_CONFIG[selectedLesson]?.description}
                </Typography>
                
                <Chip 
                  label={LESSON_CONFIG[selectedLesson]?.scenario}
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 3 }}
                />

                {/* Recording Controls */}
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
                  <RecordButton
                    isRecording={isRecording}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isLoading}
                  >
                    {isRecording ? <MicOffIcon fontSize="large" /> : <MicIcon fontSize="large" />}
                  </RecordButton>
                  
                  {isPlaying && (
                    <IconButton 
                      onClick={stopAudio}
                      sx={{ 
                        backgroundColor: '#ff9800',
                        color: 'white',
                        '&:hover': { backgroundColor: '#f57c00' }
                      }}
                    >
                      <StopIcon />
                    </IconButton>
                  )}
                  
                  <IconButton 
                    onClick={clearConversation}
                    sx={{ 
                      backgroundColor: '#f44336',
                      color: 'white',
                      '&:hover': { backgroundColor: '#c62828' }
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                </Box>

                <Typography variant="body2" align="center" color="text.secondary">
                  {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
                </Typography>

                {isLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <CircularProgress />
                  </Box>
                )}
              </CardContent>
            </LessonCard>

            {/* Feedback Section */}
            {feedback && (
              <FeedbackCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                    💡 Feedback
                  </Typography>
                  {feedback.correction && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Suggestion:</strong> {feedback.correction}
                    </Typography>
                  )}
                  <Typography variant="body2">
                    <strong>Note:</strong> {feedback.explanation}
                  </Typography>
                </CardContent>
              </FeedbackCard>
            )}
          </Box>

          {/* Right Column - Conversation */}
          <Box sx={{ flex: '2 1 400px', minWidth: '400px' }}>
            <LessonCard sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Conversation
                </Typography>
                
                <Box 
                  sx={{ 
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    p: 1,
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px'
                  }}
                >
                  {conversation.length === 0 ? (
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      align="center"
                      sx={{ mt: 4 }}
                    >
                      Start speaking to begin your conversation...
                    </Typography>
                  ) : (
                    conversation.map((message, index) => (
                      <ChatMessage 
                        key={index} 
                        isUser={message.role === 'user'}
                        elevation={2}
                      >
                        <Typography variant="body1">
                          {message.content}
                        </Typography>
                      </ChatMessage>
                    ))
                  )}
                </Box>
              </CardContent>
            </LessonCard>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DemoContainer>
    </Box>
  );
}