import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const Login = () => {
  return (
    <div className="font-space-mono min-h-screen flex flex-col items-center justify-center pt-20 px-4 bg-black text-white">
      <Typography
        variant="h4"
        className="font-space-mono space-mono-bold my-4"
        sx={{ fontFamily: '"Space Mono", monospace', fontWeight: 700 }}
      >
        Login to Re-Learn
      </Typography>
      <Box
        className="bg-gray-900 p-8 rounded-lg flex flex-col items-center"
        component="form"
        sx={{
          '& .MuiTextField-root': { m: 1.5, width: '30ch' },
          '& .MuiOutlinedInput-root': {
            fontFamily: '"Space Mono", monospace',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#38bdf8', // sky-400
            },
            '& input': {
              color: 'white',
              fontFamily: '"Space Mono", monospace',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.7)',
            fontFamily: '"Space Mono", monospace',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#38bdf8', // sky-400
          },
        }}
        noValidate
        autoComplete="off"
      >
        <TextField
          id="email"
          label="Email"
          variant="outlined"
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          variant="outlined"
        />
        <Button
          variant="contained"
          className="font-space-mono space-mono-regular my-4 text-black w-full"
          sx={{ 
            fontFamily: '"Space Mono", monospace', 
            fontWeight: 'bold', 
            py: 1.5,
            bgcolor: '#38bdf8',
            '&:hover': { bgcolor: '#0ea5e9' }
          }}
        >
          Login
        </Button>
      </Box>
    </div>
  );
};

export default Login;