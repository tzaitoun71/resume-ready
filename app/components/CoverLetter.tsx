import React from "react";
import { Typography } from "@mui/material";

interface CoverLetterProps {
  coverLetter: string;
}

const CoverLetter: React.FC<CoverLetterProps> = ({ coverLetter }) => {
  return (
    <Typography variant="body2">
      {coverLetter || "No cover letter found."}
    </Typography>
  );
};

export default CoverLetter;
