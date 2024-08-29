// app/components/Dashboard.tsx
'use client';

import React from 'react';
import { useUser } from '../context/UserContext';
import { Button, Typography, Container } from '@mui/material';

const Dashboard: React.FC = () => {
  const { user, loading, signOutUser } = useUser();

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4">Welcome, {user?.email}</Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={signOutUser}
        sx={{
          marginTop: 2,
          padding: '10px 30px',
          borderRadius: '30px',
          backgroundColor: '#4C51BF',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#3b3f7a',
          },
        }}
      >
        Sign Out
      </Button>
    </Container>
  );
};

export default Dashboard;
