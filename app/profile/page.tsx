'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Input,
  IconButton,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload'; // Import icon for file upload
import { useUser } from '../context/UserContext'; // Assuming you have a UserContext

const ProfilePage: React.FC = () => {
  const { user } = useUser(); // Custom hook to get user info from context
  const [resume, setResume] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [hasResume, setHasResume] = useState<boolean>(false);

  useEffect(() => {
    if (user?.resume && user.resume.length > 0) {
      setHasResume(true);
    }
  }, [user]);

  const handleResumeUpload = async () => {
    if (resume && user) {
      setUploading(true);
      try {
        // Prepare form data for upload
        const formData = new FormData();
        formData.append('file', resume);
        formData.append('userId', user.uid);

        const response = await fetch('/api/extract-pdf-text', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const { extractedText } = await response.json();
          console.log("Extracted PDF text:", extractedText);
          alert('Resume uploaded and processed successfully!');
          setHasResume(true); // Set the state after a successful upload
        } else {
          console.error('Failed to upload resume');
          alert('Error uploading resume. Please try again.');
        }
      } catch (error) {
        console.error('Error uploading resume:', error);
        alert('Error uploading resume. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: '40px',
          textAlign: 'center',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          width: '100%',
        }}
      >
        <Typography variant="h5" sx={{ marginBottom: '20px' }}>
          {user?.displayName}
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: '20px' }}>
          Email: {user?.email}
        </Typography>
        <Box sx={{ marginBottom: '20px' }}>
          {/* File upload button with icon */}
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{
              marginTop: '10px',
              color: '#4C51BF',
              borderColor: '#4C51BF',
              '&:hover': {
                borderColor: '#4C51BF',
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            Choose File
            {/* Hidden file input */}
            <input
              type="file"
              hidden
              onChange={(e) =>
                setResume((e.target as HTMLInputElement).files ? (e.target as HTMLInputElement).files![0] : null)
              }
            />
          </Button>
        </Box>
        {resume && (
          <Button
            variant="contained"
            onClick={handleResumeUpload}
            disabled={uploading}
            sx={{
              backgroundColor: '#4C51BF',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '20px',
              '&:hover': {
                backgroundColor: '#3b3f7a',
              },
            }}
          >
            {uploading ? 'Uploading...' : hasResume ? 'Update Resume' : 'Upload Resume'}
          </Button>
        )}
      </Paper>
    </Container>
  );
};

export default ProfilePage;
