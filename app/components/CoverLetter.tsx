"use client";

import React from "react";
import { Typography, Box, Paper, Divider } from "@mui/material";
import { useUser } from "../context/UserContext";
import ReactMarkdown from "react-markdown";
import { useParams } from "next/navigation";

const getCurrentDate = () => {
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
  return new Date().toLocaleDateString(undefined, options);
};

interface CoverLetterProps {
  coverLetter: string; 
}

const CoverLetter: React.FC<CoverLetterProps> = ({ coverLetter }) => {
  const { user } = useUser();
  const params = useParams();
  const { userId_jobId } = params as { userId_jobId: string };
  const [, jobId] = userId_jobId.split("_");

  if (!user) {
    return <Typography>No user data available</Typography>;
  }

  const application = user.applications.find((app: any) => app.id === jobId);
  const userName = `${user.firstName} ${user.lastName}`;
  const userEmail = user.email;
  const userPhone = user.phone || "(XXX) XXX - XXXX";
  const userLinkedIn = user.linkedin || "linkedin.com/in/your-profile";
  const userGitHub = user.github || "github.com/yourprofile";
  const companyName = application?.companyName || "{Company Name}";

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Paper elevation={3} sx={{ p: 4, backgroundColor: "#ffffff" }}>
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {userName}
          </Typography>
          <Typography variant="body2">
            {userEmail} | {userPhone} |{" "}
            <a href={`https://${userLinkedIn}`} target="_blank" rel="noopener noreferrer">
              {userLinkedIn}
            </a>{" "}
            |{" "}
            <a href={`https://${userGitHub}`} target="_blank" rel="noopener noreferrer">
              {userGitHub}
            </a>
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ marginBottom: 4 }}>
          <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: "bold" }}>
            {getCurrentDate()}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold", color: "red" }}>
            {"{Hiring Manager's Name}"}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {companyName}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ textAlign: "justify", lineHeight: 1.8 }}>
          <ReactMarkdown>{coverLetter}</ReactMarkdown>
        </Typography>

        <Box sx={{ marginTop: 4 }}>
          <Typography variant="body2" sx={{ marginBottom: 1 }}>
            Warm regards,
          </Typography>
          <Typography variant="body2">{userName}</Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default CoverLetter;
