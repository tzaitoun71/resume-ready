import React, { useState, useEffect } from "react";
import { Typography, Box, Button, Select, MenuItem, Modal, FormControl, InputLabel } from "@mui/material";

interface InterviewQuestion {
  type: string;
  question: string;
  answer: string;
}

interface InterviewQuestionsProps {
  interviewQuestions: InterviewQuestion[];
}

const InterviewQuestions: React.FC<InterviewQuestionsProps> = ({ interviewQuestions }) => {
  const [filter, setFilter] = useState<string>("all");
  const [filteredQuestions, setFilteredQuestions] = useState<InterviewQuestion[]>([]);
  const [open, setOpen] = useState(false); 
  const [questionType, setQuestionType] = useState<string>("Behavioral"); 

  useEffect(() => {
    if (filter === "all") {
      setFilteredQuestions(interviewQuestions || []);
    } else {
      setFilteredQuestions(
        interviewQuestions?.filter((q) => q.type === filter) || []
      );
    }
  }, [filter, interviewQuestions]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false); 

  const addMoreQuestions = async () => {
    const response = await fetch("/api/resume/analyzeText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: questionType }),
    });

    if (response.ok) {
      const newQuestions = await response.json();
      setFilteredQuestions((prevQuestions) => [...prevQuestions, ...newQuestions]);
      handleClose(); 
    } else {
      console.error("Failed to fetch new questions.");
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="Behavioral">Behavioral</MenuItem>
          <MenuItem value="Technical">Technical</MenuItem>
        </Select>
        <Button onClick={handleOpen}>ADD MORE QUESTIONS</Button>
      </Box>

      {/* Modal for selecting question type */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Select Question Type</Typography>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              label="Type"
            >
              <MenuItem value="Behavioral">Behavioral</MenuItem>
              <MenuItem value="Technical">Technical</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={addMoreQuestions}>
            Generate Questions
          </Button>
        </Box>
      </Modal>

      {filteredQuestions.length ? (
        filteredQuestions.map((q, index) => (
          <Box key={index} sx={{ mt: 2, p: 2, border: "1px solid #ddd", borderRadius: 1 }}>
            <Typography variant="h6">{q.question}</Typography>
            <Typography variant="body1">{q.answer}</Typography>
          </Box>
        ))
      ) : (
        <Typography variant="body2">No questions available.</Typography>
      )}
    </>
  );
};

export default InterviewQuestions;