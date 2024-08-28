"use client";

import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BarChartIcon from "@mui/icons-material/BarChart";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Icon for confirmation
import { db } from "./firebase"; // Import Firebase configuration
import { collection, addDoc } from "firebase/firestore";

const primaryColor = "#4C51BF";

function App() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setName("");
    setEmail("");
    setSubmitted(false);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    try {
      await addDoc(collection(db, "waitlist"), { name, email });
      setSubmitted(true);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #f0f4ff 0%, #fafaff 100%)",
        textAlign: "center",
        padding: "40px 20px",
      }}
    >
      {/* Header Section */}
      <Box sx={{ marginBottom: "50px" }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontWeight: "bold", color: "#333", marginBottom: "20px" }}
        >
          ResumeReady
        </Typography>
        <Typography
          variant="h6"
          color="textSecondary"
          sx={{ color: "#555", marginBottom: "40px" }}
        >
          The easiest way to optimize your job applications and stand out.
        </Typography>
        <Button
          variant="contained"
          onClick={handleClickOpen}
          sx={{
            backgroundColor: primaryColor,
            color: "#fff",
            padding: "10px 30px",
            borderRadius: "30px",
            marginRight: "15px",
            "&:hover": {
              backgroundColor: "#3b3f7a",
            },
          }}
        >
          Join the waitlist
        </Button>
        <Button
          variant="outlined"
          href="https://mail.google.com/mail/?view=cm&fs=1&to=teamsimp3@gmail.com&su=Contact%20via%20Portfolio&body=Hello,"
          sx={{
            padding: "10px 30px",
            borderRadius: "30px",
            marginLeft: "15px",
            borderColor: primaryColor,
            color: primaryColor,
            "&:hover": {
              backgroundColor: "#f0f0ff",
              borderColor: "#3b3f7a",
              color: "#3b3f7a",
            },
          }}
        >
          Contact Us
        </Button>
      </Box>

      {/* Features Section */}
      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignItems="stretch"
        sx={{ maxWidth: "1200px" }}
      >
        {/* Feature Boxes */}
        <Grid item xs={12} sm={6} md={3} sx={{ display: "flex" }}>
          <Paper
            elevation={3}
            sx={{
              padding: "30px",
              textAlign: "center",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              flexGrow: 1,
            }}
          >
            <CheckCircleOutlineIcon
              sx={{ fontSize: 40, color: primaryColor }}
            />
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#333", marginTop: "15px" }}
            >
              Interview Preparation Assistance
            </Typography>
            <Typography color="textSecondary">
              Get tailored interview questions and answers based on job
              descriptions.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3} sx={{ display: "flex" }}>
          <Paper
            elevation={3}
            sx={{
              padding: "30px",
              textAlign: "center",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              flexGrow: 1,
            }}
          >
            <AssignmentIcon sx={{ fontSize: 40, color: primaryColor }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#333", marginTop: "15px" }}
            >
              Cover Letter Generator
            </Typography>
            <Typography color="textSecondary">
              Create personalized cover letters tailored to each job
              application.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3} sx={{ display: "flex" }}>
          <Paper
            elevation={3}
            sx={{
              padding: "30px",
              textAlign: "center",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              flexGrow: 1,
            }}
          >
            <BarChartIcon sx={{ fontSize: 40, color: primaryColor }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#333", marginTop: "15px" }}
            >
              Analytics Dashboard
            </Typography>
            <Typography color="textSecondary">
              Track your application progress, from submission to interviews and
              offers.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3} sx={{ display: "flex" }}>
          <Paper
            elevation={3}
            sx={{
              padding: "30px",
              textAlign: "center",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              flexGrow: 1,
            }}
          >
            <AssessmentIcon sx={{ fontSize: 40, color: primaryColor }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#333", marginTop: "15px" }}
            >
              Resume Enhancement Tips
            </Typography>
            <Typography color="textSecondary">
              Receive suggestions to refine your resume based on job
              descriptions.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Waitlist Form Modal */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          Join the Waitlist
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {submitted ? (
            <Box sx={{ textAlign: "center", padding: "20px" }}>
              <CheckCircleIcon
                sx={{ fontSize: 60, color: primaryColor, marginBottom: "10px" }}
              />
              <Typography
                variant="h5"
                sx={{ color: primaryColor, marginBottom: "10px" }}
              >
                Thank you for joining the waitlist!
              </Typography>
            </Box>
          ) : (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Name"
                type="text"
                fullWidth
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <TextField
                margin="dense"
                label="Email Address"
                type="email"
                fullWidth
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          {!submitted && (
            <Button
              onClick={handleSubmit}
              sx={{
                backgroundColor: primaryColor,
                color: "#fff",
                padding: "10px 30px",
                borderRadius: "30px", // Curved edges
                "&:hover": {
                  backgroundColor: "#3b3f7a",
                },
              }}
            >
              Submit
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default App;
