// app/login/page.tsx

'use client';

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  TextField,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BarChartIcon from "@mui/icons-material/BarChart";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase"; // Import Firebase configuration
import { useRouter } from 'next/navigation';
import { useUser } from "../context/UserContext";

const primaryColor = "#4C51BF";

const LoginPage: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, setUser } = useUser();  // Use context to manage user state
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (isSignup) {
      try {
        // Create Firebase user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        setUser(newUser);

        // Prepare payload for the backend
        const payload = { 
          userId: newUser.uid, // Firebase UID
          firstName, 
          lastName,
          membership: "free"  // Initialize membership to "free"
        };

        // Send data to the backend to create a new user in MongoDB
        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Something went wrong');
        }

        router.push('/dashboard'); // Redirect after successful signup
      } catch (error) {
        console.error("Error signing up:", error);
      }
    } else {
      // Handle login
      try {
        const response = await fetch('/api/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Something went wrong');
        }

        setUser(data.user);
        router.push('/dashboard');
      } catch (error) {
        console.error("Error logging in:", error);
      }
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    router.push('/login'); // Redirect to login page after signout
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
      </Box>

      {/* Login/Signup Form Section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          marginBottom: '40px',
          maxWidth: '400px',
          width: '100%',
          height: '500px',  // Ensures both forms have the same height
          transition: 'height 0.3s ease',  // Smooth transition when switching forms
        }}
      >
        {!user ? (
          <>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', marginBottom: '20px' }}>
              {isSignup ? 'Sign Up' : 'Log In'}
            </Typography>
            {isSignup && (
              <>
                <TextField
                  label="First Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  sx={{ marginBottom: '20px' }}
                />
                <TextField
                  label="Last Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  sx={{ marginBottom: '20px' }}
                />
              </>
            )}
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ marginBottom: '20px' }}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ marginBottom: '20px' }}
            />
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{
                backgroundColor: primaryColor,
                color: "#fff",
                padding: "10px 30px",
                borderRadius: "30px",
                marginBottom: "20px",
                "&:hover": {
                  backgroundColor: "#3b3f7a",
                },
              }}
            >
              {isSignup ? 'Sign Up' : 'Log In'}
            </Button>
            <Button
              onClick={() => setIsSignup(!isSignup)}
              sx={{
                textTransform: "none",
                color: primaryColor,
                "&:hover": {
                  backgroundColor: "#f0f0ff",
                  color: "#3b3f7a",
                },
              }}
            >
              {isSignup ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSignOut}
            sx={{
              padding: "10px 30px",
              borderRadius: "30px",
              backgroundColor: "#d32f2f",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#9a0007",
              },
            }}
          >
            Sign Out
          </Button>
        )}
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
              Get tailored interview questions and answers based on job descriptions.
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
              Create personalized cover letters tailored to each job application.
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
              Track your application progress, from submission to interviews and offers.
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
              Receive suggestions to refine your resume based on job descriptions.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoginPage;
