import React from "react";
import { Typography } from "@mui/material";

interface ResumeFeedbackProps {
  resumeFeedback: string;
}

const ResumeFeedback: React.FC<ResumeFeedbackProps> = ({ resumeFeedback }) => {
  return (
    <Typography variant="body2">
      {resumeFeedback || "No resume feedback found."}
    </Typography>
  );
};

export default ResumeFeedback;
