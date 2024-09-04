import React, { useState, useEffect } from "react";
import { Typography, Box, Button, Select, MenuItem, Modal, FormControl, InputLabel } from "@mui/material";
import { useUser } from "../context/UserContext"; 
import { useParams } from "next/navigation"; 

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
  const { user } = useUser(); 
  const params = useParams();
  const { userId_jobId } = params as { userId_jobId: string };
  const [userId, jobId] = userId_jobId.split("_");

  const application = user?.applications.find((app: { id: string; jobDescription: string; interviewQuestions: InterviewQuestion[] }) => app.id === jobId);

  useEffect(() => {
    if (application?.interviewQuestions) {
      setFilteredQuestions(application.interviewQuestions);
    }
  }, [application]);

  useEffect(() => {
    if (filter === "all") {
      setFilteredQuestions(application?.interviewQuestions || []);
    } else {
      setFilteredQuestions(
        application?.interviewQuestions.filter((q: InterviewQuestion) => q.type === filter) || []
      );
    }
  }, [filter, application]);  

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const addMoreQuestions = async () => {
    if (!userId || !application) {
      console.error("Missing userId or application data.");
      return;
    }

    const payload = {
      userId: userId,
      jobId: application.id,  
      jobDescription: application.jobDescription,
      questionType,
      numQuestions: 3,
    };

    try {
      const response = await fetch("/api/generateQuestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Response Error:', errorData);
        return;
      }

      const newQuestions = await response.json();
      console.log('API Response:', newQuestions);

      if (newQuestions && newQuestions.newQuestions) {
        setFilteredQuestions((prevQuestions) => [...prevQuestions, ...newQuestions.newQuestions]);

        application.interviewQuestions = [...application.interviewQuestions, ...newQuestions.newQuestions];

        handleClose(); 
      } else {
        console.error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching new questions:", error);
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
