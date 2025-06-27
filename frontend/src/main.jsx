import React, { useMemo, useState, createContext } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// MUI Imports
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create a context for color mode
export const ColorModeContext = createContext({ toggleColorMode: () => {} });

function Main() {
  const [mode, setMode] = useState('dark'); // Default to dark mode

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  // Custom dark color palette
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'dark'
            ? {
                primary: { main: '#7f5af0' },
                secondary: { main: '#2cb67d' },
                background: {
                  default: '#16161a',
                  paper: '#242629',
                },
                text: {
                  primary: '#fffffe',
                  secondary: '#94a1b2',
                },
              }
            : {
                primary: { main: '#7f5af0' },
                secondary: { main: '#2cb67d' },
                background: {
                  default: '#f5f7fa',
                  paper: '#ffffff',
                },
                text: {
                  primary: '#16161a',
                  secondary: '#72757e',
                },
              }),
        },
        typography: {
          fontFamily: '"Playfair Display", "Roboto", "Arial", sans-serif',
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);