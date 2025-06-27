// src/pages/LessonsPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';

const LessonsContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(12),
  paddingBottom: theme.spacing(4),
}));

export default function LessonsPage() {
  const navigate = useNavigate();

  const lessons = [
    {
      id: 'coffee_shop',
      title: 'Coffee Shop Orders',
      description: 'Learn to order coffee and pastries like a native speaker',
      difficulty: 'Beginner',
      duration: '15 min'
    },
    {
      id: 'hotel_check_in',
      title: 'Hotel Check-in',
      description: 'Master hotel check-in procedures and requests',
      difficulty: 'Intermediate',
      duration: '20 min'
    }
  ];

  return (
    <Box>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ color: 'white' }}>
            <ArrowBackIcon />
          </IconButton>
          <SchoolIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Lessons
          </Typography>
        </Toolbar>
      </AppBar>

      <LessonsContainer maxWidth="md">
        <Typography variant="h3" align="center" gutterBottom sx={{ mb: 4 }}>
          Choose Your Lesson
        </Typography>

        {lessons.map((lesson) => (
          <Card key={lesson.id} sx={{ mb: 3, p: 2 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {lesson.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {lesson.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip label={lesson.difficulty} color="primary" size="small" />
                <Chip label={lesson.duration} variant="outlined" size="small" />
              </Box>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/demo')}
              >
                Start Lesson
              </Button>
            </CardContent>
          </Card>
        ))}
      </LessonsContainer>
    </Box>
  );
}