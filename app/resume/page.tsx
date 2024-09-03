"use client";

import React, { useEffect, useState, useRef } from "react";
import { Container, Typography, Box, Button, Paper } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useUser } from "../context/UserContext";
import ReactMarkdown from "react-markdown";

const ProfilePage: React.FC = () => {
  const { user, setUser, loading } = useUser(); // Use context to fetch user and setUser
  const [resume, setResume] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [hasResume, setHasResume] = useState<boolean>(false);
  const [resumeContent, setResumeContent] = useState<string>(""); // State to hold resume content
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!loading && user?.resume && user.resume.length > 0) {
      setHasResume(true);
      setResumeContent(user.resume); // Set resume content from user context
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
        const formData = new FormData();
        formData.append("file", resume);
        formData.append("userId", user.userId);

        const response = await fetch("/api/extract-pdf-text", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          const organizedText = data.organizedText; // Extract organizedText from data
          if (organizedText) {
            console.log("Extracted PDF text:", organizedText);

            // Immediately update the user context and state with new resume
            const updatedUser = { ...user, resume: organizedText }; // Create a new user object with updated resume
            setUser(updatedUser); // Update user context

            setResumeContent(organizedText); // Update resume content state
            setHasResume(true); // Update state to indicate that resume is available
            setResume(null); // Clear the file input
          } else {
            console.error("Organized text is undefined or empty");
          }
        } else {
          console.error("Failed to upload resume:", data.error);
        }
      } catch (error) {
        console.error("Error uploading resume:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Display loading indicator
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        paddingTop: "80px",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: "30px",
          textAlign: "center",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          width: hasResume ? "80vw" : "30vw",
          height: hasResume ? "auto" : "fit-content",
          maxHeight: hasResume ? "90vh" : "none",
          overflowY: hasResume ? "auto" : "hidden",
          overflowX: "hidden",
          transition: "all 0.3s ease-in-out",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {hasResume ? (
          <>
            {/* Resume Preview and Content */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              {/* Placeholder for any additional content */}
            </Box>

            {resumeContent && (
              <Box
                sx={{
                  width: "100%",
                  maxHeight: "70vh",
                  overflowY: "auto",
                  overflowX: "hidden",
                  border: "1px solid #ddd",
                  padding: "20px",
                  marginBottom: "20px",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  textAlign: "left",
                }}
              >
                <ReactMarkdown>{resumeContent}</ReactMarkdown>
              </Box>
            )}
          </>
        ) : (
          <>
            <Typography
              variant="h6"
              sx={{ marginBottom: "10px", color: "#666" }}
            >
              Upload your resume to get started today!
            </Typography>
            <Typography
              variant="body2"
              sx={{ marginBottom: "20px", color: "#999" }}
            >
              Upload your resume to let us help you track your career progress.
              Gain insights, improve your applications, and more.
            </Typography>
          </>
        )}

        {/* File upload button with icon */}
        <Box sx={{ marginBottom: "10px" }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{
              color: "#4C51BF",
              borderColor: "#4C51BF",
              "&:hover": {
                borderColor: "#4C51BF",
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            {hasResume ? "Update Resume" : "Upload Resume"}
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
              backgroundColor: "#4C51BF",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "20px",
              "&:hover": {
                backgroundColor: "#3b3f7a",
              },
            }}
          >
            {uploading ? "Uploading..." : "Upload Resume"}
          </Button>
        )}
      </Paper>
    </Container>
  );
};

export default ProfilePage;
