import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const CustomNavbar = ({ theme, toggleTheme }) => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        className="bg-transparent-blue dark:bg-transparent-blue-dark backdrop-blur-sm w-full z-10"
        sx={{ boxShadow: 'none' }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1 }}
            className="font-space-mono space-mono-bold"
          >
            Re-Learn
          </Typography>
          <IconButton
            color="inherit"
            onClick={toggleTheme}
            className="font-space-mono"
          >
            {theme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default CustomNavbar;