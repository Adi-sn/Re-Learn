import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const Login = ({ theme }) => {
  return (
    <div className="font-space-mono min-h-screen flex flex-col bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="flex-1 flex flex-col items-center justify-center">
        <Typography
          variant="h4"
          className="font-space-mono space-mono-bold my-4"
          sx={{
            fontFamily: '"Space Mono", monospace',
            fontWeight: 700,
          }}
        >
          Login to Re-Learn
        </Typography>
        <Box
          className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg flex flex-col items-center"
          component="form"
          sx={{
            '& .MuiTextField-root': { m: 1, width: '25ch' },
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
          noValidate
          autoComplete="off"
        >
          <TextField
            id="email"
            label="Email"
            variant="outlined"
            className="font-space-mono my-4"
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            variant="outlined"
            className="font-space-mono my-4"
          />
          <Button
            variant="contained"
            color="primary"
            className="font-space-mono space-mono-regular my-4 text-white bg-blue-600 hover:bg-blue-700"
          >
            Login
          </Button>
        </Box>
      </div>
    </div>
  );
};

export default Login;