import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const Navbar = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        className="bg-transparent-blue dark:bg-transparent-blue-dark backdrop-blur-sm w-full z-10"
        sx={{ boxShadow: 'none' }}
      >
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            {/* Menu icon can be added here if needed */}
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1 }}
            className="font-space-mono space-mono-bold"
          >
            Re-Learn
          </Typography>
          <Button
            color="inherit"
            className="font-space-mono space-mono-regular"
            sx={{ mx: 1 }}
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
          <Button
            color="inherit"
            className="font-space-mono space-mono-regular"
            sx={{ mx: 1 }}
          >
            Sign Up
          </Button>
          <Button
            variant="contained"
            sx={{
              mx: 1,
              bgcolor: '#38bdf8', // Tailwind sky-400
              color: 'white',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              '&:hover': { bgcolor: '#0ea5e9' }, // Tailwind sky-500
            }}
            onClick={() => navigate('/survey')}
          >
            DEMO
          </Button>
          <IconButton
            color="inherit"
            onClick={toggleTheme}
            className="font-space-mono"
            sx={{ mx: 1 }}
          >
            {theme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;