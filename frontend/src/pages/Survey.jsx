import * as React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const Survey = ({ theme }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/questions');
        const data = await response.json();
        setMessages(data.map(q => ({ text: q, sender: 'bot' })));
      } catch (error) {
        console.error('Error fetching questions:', error);
        setMessages([{ text: 'Sample question: How do you like Re-Learn?', sender: 'bot' }]);
      }
    };
    fetchQuestions();
  }, []);

  const handleSend = () => {
    if (inputValue.trim()) {
      const newMessage = { text: inputValue, sender: 'user' };
      setMessages([...messages, newMessage]);

      sendResponseToBackend(inputValue);

      setInputValue('');
    }
  };

  const handleFinish = () => {
    console.log('Survey finished!');
    // Replace with actual finish logic (e.g., API call or navigation)
  };

  const sendResponseToBackend = async (response) => {
    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response }),
      });
      console.log('Response sent:', response);
    } catch (error) {
      console.error('Error sending response:', error);
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
          Re-Learn Survey
        </Typography>
        <Box
          className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg w-full max-w-6xl flex flex-col"
          sx={{
            height: '65vh',
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
        <Box className="w-full max-w-2xl mt-4 flex items-center">
          <TextField
            variant="outlined"
            fullWidth
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your answer..."
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
              '& .MuiInputLabel-root': {
                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                fontFamily: '"Space Mono", monospace',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#1976d2',
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSend}
            className="font-space-mono space-mono-regular ml-2"
            sx={{ height: '56px', minWidth: '100px' }} // Match TextField height and set wider width
          >
            Send
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleFinish}
            className="font-space-mono space-mono-regular ml-2"
            sx={{ height: '56px', minWidth: '100px' }} // Match TextField height and set wider width
          >
            Finish
          </Button>
        </Box>
      </div>
    </div>
  );
};

export default Survey;