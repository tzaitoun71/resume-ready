import React from "react";
import { Box, List, ListItem, ListItemText, ListItemIcon } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Changed icon for a better visual

interface ResumeFeedbackProps {
  resumeFeedback: string;
}

const ResumeFeedback: React.FC<ResumeFeedbackProps> = ({ resumeFeedback }) => {
  // Split the feedback into individual points based on "POINT "
  const feedbackPoints = resumeFeedback ? resumeFeedback.split("POINT ").filter(Boolean) : ["No resume feedback found."];

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <List>
        {feedbackPoints.map((point, index) => (
          <ListItem key={index} sx={{ alignItems: 'flex-start', paddingLeft: 0, paddingBottom: '8px' }}>
            <ListItemIcon sx={{ minWidth: '32px', marginTop: '5px' }}>
              <CheckCircleIcon sx={{ color: "#4C51BF", fontSize: "20px" }} />
            </ListItemIcon>
            <ListItemText
              primary={point.trim()} // Trim any leading/trailing whitespace
              primaryTypographyProps={{
                variant: "body1",
                sx: { color: "#333", lineHeight: 1.5, wordBreak: 'break-word', marginTop: '-2px' } // Adjusted margin for alignment
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ResumeFeedback;
