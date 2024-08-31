// app/profile/page.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useUser } from '../context/UserContext';
import ReactMarkdown from 'react-markdown';

const ResumePage: React.FC = () => {
  const { user, setUser, loading } = useUser(); // Add setUser to update context
  const [resume, setResume] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [hasResume, setHasResume] = useState<boolean>(false);
  const [resumeContent, setResumeContent] = useState<string>(''); // State to hold resume content
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Reference for file input

  useEffect(() => {
    if (!loading && user?.resume && user.resume.length > 0) {
      setHasResume(true);
      setResumeContent(user.resume); // Assuming 'resume' contains text content
    }
  }, [user, loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setResume(file);
  };

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

        const data = await response.json();

        if (response.ok) {
          const organizedText = data.organizedText;  // Correctly extract organizedText from data
          if (organizedText) {
            console.log("Extracted PDF text:", organizedText);
            setResumeContent(organizedText); // Update resume content
            setUser({ ...user, resume: organizedText });  // Update user context immediately
            setHasResume(true); // Set the state after a successful upload
            setResume(null); // Reset the file input after upload
          } else {
            console.error('Organized text is undefined or empty');
          }
        } else {
          console.error('Failed to upload resume:', data.error);
        }
      } catch (error) {
        console.error('Error uploading resume:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while fetching user data
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        paddingTop: '80px',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: '30px',
          textAlign: 'center',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          width: hasResume ? '80vw' : '30vw',  // Adjust width based on resume availability
          height: hasResume ? 'auto' : 'fit-content',  // Adjust height when there's no resume
          maxHeight: hasResume ? '90vh' : 'none',  // Set max height only when resume is present
          overflowY: hasResume ? 'auto' : 'hidden',  // Allow scrolling only when resume is present
          overflowX: 'hidden',  // Prevent horizontal scrolling
          transition: 'all 0.3s ease-in-out',  // Smooth transition when changing size
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {hasResume ? (
          <>
            {/* Resume Preview and Content */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
            </Box>

            {resumeContent && (
              <Box
                sx={{
                  width: '100%',
                  maxHeight: '70vh',  // Adjusted to fit within viewport height constraints
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  border: '1px solid #ddd',
                  padding: '20px',
                  marginBottom: '20px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  textAlign: 'left',
                }}
              >
                <ReactMarkdown>{resumeContent}</ReactMarkdown>
              </Box>
            )}
          </>
        ) : (
          <>
            <Typography variant="h6" sx={{ marginBottom: '10px', color: '#666' }}>
              Upload your resume to get started today!
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: '20px', color: '#999' }}>
              Upload your resume to let us help you track your career progress. Gain insights, improve your applications, and more.
            </Typography>
          </>
        )}

        {/* File upload button with icon */}
        <Box sx={{ marginBottom: '10px' }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{
              color: '#4C51BF',
              borderColor: '#4C51BF',
              '&:hover': {
                borderColor: '#4C51BF',
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            {hasResume ? 'Update Resume' : 'Upload Resume'}
            {/* Hidden file input */}
            <input
              type="file"
              hidden
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </Button>
        </Box>

        {/* Upload Resume Button */}
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
            {uploading ? 'Uploading...' : 'Upload Resume'}
          </Button>
        )}
      </Paper>
    </Container>
  );
};

export default ResumePage;
