"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Typography,
  Container,
  Tabs,
  Tab,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { useUser } from "../context/UserContext";
import ResumeFeedback from "../components/ResumeFeedback";
import CoverLetter from "../components/CoverLetter";
import InterviewQuestions from "../components/InterviewQuestions";

const JobDetails: React.FC = () => {
  const params = useParams();
  const { userId_jobId } = params as { userId_jobId: string };
  const [userId, jobId] = userId_jobId.split("_");
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    if (user.membership === "free" && (newValue === 1 || newValue === 2)) {
      return; // Prevent navigation for "free" members
    }
    setActiveTab(newValue); // Allow navigation for "plus" members
  };

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
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: isSmallScreen ? "95%" : "80%",
          maxWidth: "1400px",
          minWidth: isSmallScreen ? "90%" : "80%",
          height: "calc(100vh - 180px)", 
          maxHeight: "85vh",
          borderRadius: "8px",
          boxShadow: 2,
          bgcolor: "white",
          p: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          marginTop: isSmallScreen ? "10px" : "20px",
          overflowY: "auto",
          overflowX: "hidden", 
          marginBottom: "40px",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          {application?.companyName}
        </Typography>
        <Typography variant="h6" component="h2" gutterBottom>
          {application?.position} - {application?.location} -{" "}
          <span style={{ color: "#4C51BF", fontWeight: "bold" }}>
            {application?.status}
          </span>
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, whiteSpace: "pre-line" }}>
          {application?.jobDescription}
        </Typography>

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
          {user.membership === "free" ? (
            <Tooltip title="Upgrade to Plus for access" placement="top">
              <Box display="flex" alignItems="center">
                <Tab
                  label={
                    <Box display="flex" alignItems="center">
                      COVER LETTER
                      <LockIcon fontSize="small" sx={{ ml: 1, color: "gray" }} />
                    </Box>
                  }
                  sx={{ color: "gray" }}
                  disabled
                />
              </Box>
            </Tooltip>
          ) : (
            <Tab
              label="COVER LETTER"
              sx={{ color: activeTab === 1 ? "#4C51BF" : "gray" }}
            />
          )}
          {user.membership === "free" ? (
            <Tooltip title="Upgrade to Plus for access" placement="top">
              <Box display="flex" alignItems="center">
                <Tab
                  label={
                    <Box display="flex" alignItems="center">
                      INTERVIEW QUESTIONS
                      <LockIcon fontSize="small" sx={{ ml: 1, color: "gray" }} />
                    </Box>
                  }
                  sx={{ color: "gray" }}
                  disabled
                />
              </Box>
            </Tooltip>
          ) : (
            <Tab
              label="INTERVIEW QUESTIONS"
              sx={{ color: activeTab === 2 ? "#4C51BF" : "gray" }}
            />
          )}
        </Tabs>

        <Box
          sx={{
            width: "100%",
            overflowY: "auto",
            flexGrow: 1,
            paddingRight: "16px",
            maxHeight: "60vh",
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
