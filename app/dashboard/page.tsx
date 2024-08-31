'use client';

import React, { useEffect } from 'react';
import { Box, Typography, CircularProgress, Container } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext';

const Dashboard: React.FC = () => {
  const { user, loading } = useUser();
  const router = useRouter();
  
  if (loading) {
    // Display a loading indicator while user data is being fetched
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh', // Full height to center the spinner vertically
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null; // Prevent component from rendering if user data is not loaded
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        marginTop: '80px', // Add margin to account for the fixed navbar height
        padding: '20px', // Add padding for some space around the content
      }}
    >
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to the Dashboard, {user.firstName}!
        </Typography>
        <Typography variant="body1">
          Here is where you can view your data and manage your profile.
        </Typography>
      </Box>
    </Container>
  );
};

export default Dashboard;
