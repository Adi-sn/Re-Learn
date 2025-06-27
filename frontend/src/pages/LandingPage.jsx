// src/pages/LandingPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Fade,
  Slide,
  Zoom,
  useScrollTrigger,
  Fab,
  Grow,
  Switch,
  Tooltip,
} from '@mui/material';
import { styled, keyframes, useTheme } from '@mui/material/styles';
import SchoolIcon from '@mui/icons-material/School';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { ColorModeContext } from '../main.jsx';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
const AnimatedAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.background.paper,
  backdropFilter: 'blur(20px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
}));

const Logo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const LogoIcon = styled(SchoolIcon)(({ theme }) => ({
  fontSize: '2rem',
  color: theme.palette.primary.main,
  marginRight: theme.spacing(1),
  animation: `${float} 3s ease-in-out infinite`,
}));

const NavButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  padding: '8px 20px',
  borderRadius: '25px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  },
}));

const DemoButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  fontWeight: 700,
  textTransform: 'none',
  fontSize: '1rem',
  padding: '12px 30px',
  borderRadius: '30px',
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-200%',
    width: '200%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    animation: `${shimmer} 2s infinite`,
  },
  '&:hover': {
    transform: 'translateY(-3px) scale(1.05)',
    boxShadow: `0 10px 30px ${theme.palette.primary.main}44`,
  },
}));

const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
  position: 'relative',
  color: theme.palette.text.primary,
  overflow: 'visible',
  paddingTop: theme.spacing(12),
}));

const MainTitle = styled(Typography)(({ theme }) => ({
  fontFamily: '"Playfair Display", serif',
  fontWeight: 700,
  fontSize: 'clamp(3rem, 8vw, 6rem)',
  textAlign: 'center',
  marginBottom: theme.spacing(3),
  marginTop: theme.spacing(6),
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  animation: `${fadeInUp} 1s ease-out`,
  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
}));

const Description = styled(Typography)(({ theme }) => ({
  fontFamily: '"Playfair Display", serif',
  fontStyle: 'italic',
  fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
  textAlign: 'center',
  maxWidth: '900px',
  lineHeight: 1.7,
  color: theme.palette.text.secondary,
  animation: `${fadeInUp} 1s ease-out 0.3s both`,
  margin: '0 auto',
  marginBottom: theme.spacing(6),
}));

const ScrollToTop = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  '&:hover': {
    transform: 'scale(1.1)',
    background: `linear-gradient(45deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
  },
}));

function ScrollTop({ children }) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Zoom in={trigger}>
      <ScrollToTop onClick={handleClick}>
        {children}
      </ScrollToTop>
    </Zoom>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const projectDescription = `
Welcome to Re-Learn, the revolutionary conversational language learning platform that transforms how you master new languages.

Our cutting-edge AI-powered system creates immersive, real-world scenarios that adapt to your learning pace and style. Whether you're ordering coffee in a bustling café, checking into a luxury hotel, or navigating complex business negotiations, Re-Learn provides authentic conversational experiences that prepare you for real-life interactions.

Through advanced speech recognition, intelligent feedback systems, and personalized learning paths, we make language learning engaging, effective, and enjoyable. Our platform combines the latest in artificial intelligence with proven pedagogical methods to deliver results that traditional language learning apps simply can't match.

Join thousands of learners who have already discovered the power of conversational AI in language acquisition. Experience the future of language learning today with Re-Learn.
`;

  return (
    <Box>
      <AnimatedAppBar position="fixed" elevation={0}>
        <Toolbar>
          <Logo onClick={() => navigate('/')}>
            <LogoIcon />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 700,
                color: 'primary.main',
                fontSize: '1.5rem',
              }}
            >
              Re-Learn
            </Typography>
          </Logo>

          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title={theme.palette.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton onClick={colorMode.toggleColorMode} color="inherit" sx={{ mr: 2 }}>
              {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          <NavButton
            color="primary"
            variant="outlined"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </NavButton>

          <NavButton
            color="primary"
            variant="text"
            onClick={() => navigate('/login')}
          >
            Login
          </NavButton>

          <DemoButton
            variant="contained"
            onClick={() => navigate('/demo')}
          >
            Demo
          </DemoButton>
        </Toolbar>
      </AnimatedAppBar>

      <HeroSection>
        <Container maxWidth="lg">
          <Fade in={isVisible} timeout={1000}>
            <MainTitle variant="h1">
              Re-Learn
            </MainTitle>
          </Fade>

          <Slide direction="up" in={isVisible} timeout={1500}>
            <Description variant="h5">
              {projectDescription}
            </Description>
          </Slide>

          <Grow in={isVisible} timeout={2000}>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/demo')}
                sx={{
                  fontSize: '1.2rem',
                  padding: '15px 40px',
                  borderRadius: '30px',
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  color: 'white',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: `linear-gradient(45deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
                    transform: 'translateY(-3px)',
                    boxShadow: `0 10px 30px ${theme.palette.primary.main}44`,
                  },
                }}
              >
                Get Started
              </Button>
            </Box>
          </Grow>
        </Container>
      </HeroSection>

      <ScrollTop>
        <KeyboardArrowUpIcon />
      </ScrollTop>
    </Box>
  );
}