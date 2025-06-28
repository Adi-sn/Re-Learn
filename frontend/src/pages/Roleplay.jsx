
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';

import { useLocation } from 'react-router-dom';

const Roleplay = ({ theme }) => {
  const location = useLocation();
  const { cefrLevel, scenario, sessionId, initialBotMessage } = location.state || { cefrLevel: 'A1', scenario: 'You are at a coffee shop and need to order a drink.', sessionId: null, initialBotMessage: 'Welcome to the roleplay! You can start the conversation.' };

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [correction, setCorrection] = useState('Your correction will appear here.');
  const [explanation, setExplanation] = useState('An explanation of the correction will appear here.');

  useEffect(() => {
    // Set initial bot message and play audio
    if (initialBotMessage) {
      setMessages([{ text: initialBotMessage, sender: 'bot' }]);
      // Request audio for the initial message
      const fetchInitialAudio = async () => {
        try {
          const response = await fetch('http://localhost:8000/roleplay/initial_audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: initialBotMessage, cefr_level: cefrLevel }),
          });
          const data = await response.json();
          if (data.audio_reply) {
            playAudio(data.audio_reply);
          }
        } catch (error) {
          console.error('Error fetching initial audio:', error);
        }
      };
      fetchInitialAudio();
    }
  }, [initialBotMessage, cefrLevel]);

  const playAudio = (audioData) => {
    const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
    audio.play();
  };

  const handleSend = async () => {
    if (inputValue.trim() && sessionId) {
      const newMessage = { text: inputValue, sender: 'user' };
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      try {
        const formData = new FormData();
        formData.append('session_id', sessionId);
        formData.append('user_input_text', inputValue);

        const response = await fetch('http://localhost:8000/roleplay/turn', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();

        setMessages((prevMessages) => [...prevMessages, { text: data.bot_message, sender: 'bot' }]);
        setCorrection(data.correction);
        setExplanation(data.explanation);
        playAudio(data.audio_reply);

      } catch (error) {
        console.error('Error sending roleplay turn:', error);
        setMessages((prevMessages) => [...prevMessages, { text: 'Error processing response.', sender: 'bot' }]);
      }

      setInputValue('');
    }
  };

  const handleMicClick = async () => {
    if (!isRecording) {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone stream obtained:', stream);
        console.log('Stream active:', stream.active);

        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length === 0) {
          console.error('No audio tracks found in the stream.');
          alert('No audio input device detected. Please check your microphone.');
          return;
        }
        console.log('Audio tracks:', audioTracks);
        console.log('Audio track readyState:', audioTracks[0].readyState);

        const options = { mimeType: 'audio/wav' }; // Changed to audio/wav for testing
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          console.warn(`${options.mimeType} is not supported, trying default.`);
          options.mimeType = 'audio/webm'; // Fallback to a more generic webm
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.error(`Neither ${options.mimeType} nor audio/webm is supported.`);
            alert('Your browser does not support audio recording.');
            return;
          }
        }

        const recorder = new MediaRecorder(stream, options);
        setMediaRecorder(recorder);
        setAudioChunks([]);

        recorder.onstart = () => {
          console.log('MediaRecorder state: ', recorder.state);
        };

        recorder.ondataavailable = (event) => {
          console.log('ondataavailable event:', event, 'data size:', event.data.size);
          if (event.data.size > 0) {
            setAudioChunks((prev) => [...prev, event.data]);
          }
        };

        recorder.onerror = (event) => {
          console.error('MediaRecorder error:', event.error);
          alert('An error occurred during recording. Please try again.');
        };

        recorder.onstop = async () => {
          console.log('MediaRecorder state on stop: ', recorder.state);
          console.log('Recording stopped, processing audio...');
          console.log('Audio chunks before Blob creation:', audioChunks);

          const audioBlob = new Blob(audioChunks, { type: options.mimeType });
          console.log('Audio Blob created:', audioBlob, 'size:', audioBlob.size);

          // Stop all tracks in the stream to release microphone
          stream.getTracks().forEach(track => track.stop());

          if (audioBlob.size === 0) {
            console.error('Recorded audio blob is empty.');
            alert('No audio was recorded. Please ensure your microphone is working and you spoke into it.');
            return;
          }

          const formData = new FormData();
          formData.append('session_id', sessionId);
          formData.append('audio_file', audioBlob, 'audio.webm'); // Filename can be generic

          try {
            console.log('Sending audio to backend...');
            const response = await fetch('http://localhost:8000/roleplay/turn', {
              method: 'POST',
              body: formData,
            });
            const data = await response.json();
            console.log('Backend response:', data);

            setMessages((prevMessages) => [...prevMessages, { text: data.bot_message, sender: 'bot' }]);
            setCorrection(data.correction);
            setExplanation(data.explanation);
            playAudio(data.audio_reply);

          } catch (error) {
            console.error('Error sending audio to backend:', error);
            setMessages((prevMessages) => [...prevMessages, { text: 'Error processing response.', sender: 'bot' }]);
          }
        };

        recorder.start(1000); // Collect data every 1 second
        setIsRecording(true);
        console.log('Recording started. Data will be collected every 1 second.');

        // Force stop after 5 seconds for debugging
        setTimeout(() => {
          if (recorder.state === 'recording') {
            console.log('Forcing recording stop after 5 seconds for debugging.');
            recorder.stop();
          }
        }, 5000);

      } catch (error) {
        console.error('Error accessing microphone or starting recording:', error);
        alert('Could not access microphone. Please check permissions and ensure no other application is using it.');
      }
    } else {
      // Stop recording
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        console.log('Stopping recording.');
        mediaRecorder.stop();
        setIsRecording(false);
      }
    }
  };

  return (
    <div className="font-space-mono min-h-screen flex flex-col bg-white dark:bg-gray-900 text-black dark:text-white overflow-x-hidden">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Typography
          variant="h4"
          className="font-space-mono space-mono-bold my-4"
          sx={{
            fontFamily: '"Space Mono", monospace',
            fontWeight: 700,
          }}
        >
          Roleplay Scenario
        </Typography>
        <Typography
          variant="h6"
          className="font-space-mono my-2 text-center"
          sx={{
            fontFamily: '"Space Mono", monospace',
          }}
        >
          {scenario}
        </Typography>
        <Typography
          variant="h6"
          className="font-space-mono my-2 text-center"
          sx={{
            fontFamily: '"Space Mono", monospace',
          }}
        >
          CEFR Level: {cefrLevel}
        </Typography>
        <div className="flex w-full max-w-7xl mx-auto">
          {/* Left Column: Chat */}
          <div className="flex-1 flex flex-col pr-4">
            <Box
              className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg w-full flex flex-col"
              sx={{
                height: '60vh',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              {messages.map((message, index) => (
                <Box
                  key={index}
                  className={`my-2 p-2 rounded-lg ${
                    message.sender === 'bot'
                      ? 'bg-blue-200 dark:bg-blue-800 text-black dark:text-white'
                      : 'bg-green-200 dark:bg-green-800 text-black dark:text-white self-end'
                  }`}
                  sx={{
                    maxWidth: '80%',
                    wordBreak: 'break-word',
                    fontFamily: '"Space Mono", monospace',
                  }}
                >
                  {message.text}
                </Box>
              ))}
            </Box>
            <Box className="w-full mt-4 flex items-center">
              <TextField
                variant="outlined"
                fullWidth
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="font-space-mono"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: '"Space Mono", monospace',
                    '& fieldset': {
                      borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                    },
                    '& input': {
                      color: theme === 'dark' ? 'white' : 'black',
                      fontFamily: '"Space Mono", monospace',
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSend}
                className="font-space-mono space-mono-regular ml-2"
                sx={{ height: '56px' }}
              >
                <SendIcon />
              </Button>
              <Button
                variant="contained"
                color={isRecording ? 'secondary' : 'primary'}
                onClick={handleMicClick}
                className="font-space-mono space-mono-regular ml-2"
                sx={{ height: '56px' }}
              >
                <MicIcon />
              </Button>
            </Box>
          </div>

          {/* Right Column: Suggestions */}
          <div className="w-1/3 flex flex-col pl-4">
            <Typography variant="h6" className="font-space-mono space-mono-bold mb-2">💡 Instant Feedback</Typography>
            <Box className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
              <Typography variant="subtitle1" className="font-space-mono space-mono-bold mb-1">Suggested Correction</Typography>
              <Typography variant="body2" className="font-space-mono">{correction}</Typography>
            </Box>
            <Box className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <Typography variant="subtitle1" className="font-space-mono space-mono-bold mb-1">Explanation</Typography>
              <Typography variant="body2" className="font-space-mono">{explanation}</Typography>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roleplay;
