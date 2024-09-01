"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Typography,
  Container,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useUser } from "../context/UserContext";
import ResumeFeedback from "../components/ResumeFeedback";
import CoverLetter from "../components/CoverLetter";
import InterviewQuestions from "../components/InterviewQuestions";

const JobDetails: React.FC = () => {
  // Use useParams to extract dynamic route parameters
  const params = useParams();
  const { userId_jobId } = params as { userId_jobId: string };

  // Split the combined `userId_jobId` into separate variables
  const [userId, jobId] = userId_jobId.split("_");
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Find the application by jobId
  const application = user?.applications.find((app: any) => app.id === jobId);

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #f0f4ff 0%, #fafaff 100%)",
        paddingTop: isSmallScreen ? "60px" : "80px",
        paddingBottom: isSmallScreen ? "40px" : "60px",
        boxSizing: "border-box",
        overflow: "auto", // Allow scrolling for the container
      }}
    >
      {/* Main Box */}
      <Box
        sx={{
          width: isSmallScreen ? "95%" : "80%",
          maxWidth: "1400px",
          minWidth: isSmallScreen ? "90%" : "80%",
          height: "85vh", // Set a specific height for the main box to enforce scrolling
          maxHeight: "85vh", // Limit height to 85% of viewport height
          borderRadius: "8px",
          boxShadow: 2,
          bgcolor: "white",
          p: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          marginTop: isSmallScreen ? "10px" : "20px",
          overflowY: "auto", // Enable vertical scrolling
          marginBottom: "40px",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          {application?.companyName}
        </Typography>
        <Typography variant="h6" component="h2" gutterBottom>
          {application?.position} -{" "}
          <span style={{ color: "#4C51BF", fontWeight: "bold" }}>
            {application?.status}
          </span>
        </Typography>
        {/* Preserve original spacing for job description */}
        <Typography variant="body1" sx={{ mb: 3, whiteSpace: "pre-line" }}>
          {application?.jobDescription}
        </Typography>

        {/* Tabs for Resume Feedback, Cover Letters, Interview Questions */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{ borderBottom: 1, borderColor: "divider", marginBottom: 2 }}
          TabIndicatorProps={{ style: { backgroundColor: "#4C51BF" } }}
        >
          <Tab
            label="RESUME FEEDBACK"
            sx={{ color: activeTab === 0 ? "#4C51BF" : "gray" }}
          />
          <Tab
            label="COVER LETTER"
            sx={{ color: activeTab === 1 ? "#4C51BF" : "gray" }}
          />
          <Tab
            label="INTERVIEW QUESTIONS"
            sx={{ color: activeTab === 2 ? "#4C51BF" : "gray" }}
          />
        </Tabs>

        {/* Content Box for Tabs */}
        <Box
          sx={{
            width: "100%",
            overflowY: "auto", // Enable vertical scrolling
            flexGrow: 1,
            paddingRight: "16px", // Add padding to avoid scrollbar overlap
            maxHeight: "60vh", // Limit height to ensure scrolling is needed
          }}
        >
          {activeTab === 0 && (
            <ResumeFeedback resumeFeedback={application?.resumeFeedback} />
          )}
          {activeTab === 1 && (
            <CoverLetter coverLetter={application?.coverLetter} />
          )}
          {activeTab === 2 && (
            <InterviewQuestions
              interviewQuestions={application?.interviewQuestions}
            />
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default JobDetails;
