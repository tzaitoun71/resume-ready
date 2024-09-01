import React from "react";
import { Typography } from "@mui/material";

interface InterviewQuestionsProps {
  interviewQuestions: string[];
}

const InterviewQuestions: React.FC<InterviewQuestionsProps> = ({ interviewQuestions }) => {
  return (
    <Typography variant="body2">
      {interviewQuestions.length
        ? interviewQuestions.join(", ")
        : "No interview questions found."}
    </Typography>
  );
};

export default InterviewQuestions;
