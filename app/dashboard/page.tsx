'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Container, Button, Modal, TextField } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext';

const Dashboard: React.FC = () => {
  const { user, loading } = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    setLoadingFeedback(true);
    try {
      const response = await fetch('/api/resume/analyzeText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.userId, jobDescription }),
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(data.suggestions);
      } else {
        setFeedback('Failed to generate feedback.');
      }
    } catch (error) {
      setFeedback('Error generating feedback.');
    } finally {
      setLoadingFeedback(false);
      handleClose();
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        marginTop: '80px',
        padding: '20px',
      }}
    >
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to the Dashboard, {user.firstName}!
        </Typography>
        <Typography variant="body1">
          Here is where you can view your data and manage your profile.
        </Typography>
        <Button variant="contained" color="primary" onClick={handleOpen} sx={{ marginTop: '20px' }}>
          Refine Resume
        </Button>
      </Box>

      {/* Modal for Job Description Input */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Enter Job Description
          </Typography>
          <TextField
            label="Job Description"
            multiline
            rows={4}
            fullWidth
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            sx={{ marginBottom: '20px' }}
          />
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loadingFeedback}>
            {loadingFeedback ? 'Generating...' : 'Submit'}
          </Button>
        </Box>
      </Modal>

      {feedback && (
        <Box sx={{ marginTop: '20px' }}>
          <Typography variant="body1" color="textSecondary">
            {feedback}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;
