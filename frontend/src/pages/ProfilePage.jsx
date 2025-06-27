// src/pages/ProfilePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const ProfileContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(12),
  paddingBottom: theme.spacing(4),
}));

export default function ProfilePage() {
  const navigate = useNavigate();

  return (
    <Box>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ color: 'white' }}>
            <ArrowBackIcon />
          </IconButton>
          <SchoolIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Profile
          </Typography>
        </Toolbar>
      </AppBar>

      <ProfileContainer maxWidth="md">
        <Card sx={{ mb: 3, p: 2 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ width: 80, height: 80 }}>
              <AccountCircleIcon sx={{ fontSize: 60 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" gutterBottom>
                John Doe
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                john.doe@example.com
              </Typography>
              <Chip label="Beginner" color="primary" />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ p: 2 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Learning Progress
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Progress tracking features coming soon...
            </Typography>
          </CardContent>
        </Card>
      </ProfileContainer>
    </Box>
  );
}