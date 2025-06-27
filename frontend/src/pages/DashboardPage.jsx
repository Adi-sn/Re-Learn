// src/pages/DashboardPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const DashboardContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(12),
  paddingBottom: theme.spacing(4),
  minHeight: '100vh',
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

export default function DashboardPage() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Interactive Lessons',
      description: 'Practice real-world scenarios with AI companions',
      action: 'Start Learning',
      path: '/lessons'
    },
    {
      title: 'Voice Practice',
      description: 'Improve pronunciation with speech recognition',
      action: 'Try Demo',
      path: '/demo'
    },
    {
      title: 'Progress Tracking',
      description: 'Monitor your learning journey and achievements',
      action: 'View Progress',
      path: '/profile'
    }
  ];

  return (
    <Box>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton onClick={() => navigate('/')} sx={{ color: 'white' }}>
            <HomeIcon />
          </IconButton>
          <SchoolIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Re-Learn Dashboard
          </Typography>
          <IconButton onClick={() => navigate('/profile')} sx={{ color: 'white' }}>
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <DashboardContainer maxWidth="lg">
        <Typography variant="h3" align="center" gutterBottom sx={{ mb: 4 }}>
          Welcome to Your Learning Journey
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <FeatureCard>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="large" 
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => navigate(feature.path)}
                    fullWidth
                  >
                    {feature.action}
                  </Button>
                </CardActions>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </DashboardContainer>
    </Box>
  );
}