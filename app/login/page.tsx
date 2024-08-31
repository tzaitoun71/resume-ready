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
  CircularProgress,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BarChartIcon from "@mui/icons-material/BarChart";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssessmentIcon from "@mui/icons-material/Assessment";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user, setUser, loading } = useUser();  // Use context to manage user state, add loading
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("Firebase User logged in:", currentUser);
        fetchUserData(currentUser.uid); // Fetch user data from MongoDB
      } else {
        console.log("No Firebase user logged in");
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  const fetchUserData = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        router.push('/dashboard'); // Redirect to dashboard after fetching user data
      } else {
        console.error("Failed to fetch user data from MongoDB:", await response.text());
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (isSignup) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        console.log("Firebase signup successful:", newUser);
        setUser(newUser);

        const payload = { 
          userId: newUser.uid, // Firebase UID
          firstName, 
          lastName,
          membership: "free"  // Initialize membership to "free"
        };

        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = await response.json();
          console.log("Signup error response:", data);
          throw new Error(data.error || 'Something went wrong');
        }

        console.log("User signup data sent to MongoDB");
        router.refresh(); // Refresh the page after successful signup
      } catch (error: any) {
        console.error("Error signing up:", error);
        setErrorMessage(error.message); // Show error message
      }
    } else {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const loggedInUser = userCredential.user;
        console.log("Firebase login successful:", loggedInUser);
        setUser(loggedInUser);

        const response = await fetch(`/api/users/${loggedInUser.uid}`);
        if (!response.ok) {
          const data = await response.json();
          console.log("Fetch user data error response:", data);
          throw new Error(data.error || 'Failed to fetch user data');
        }

        const data = await response.json();
        console.log("MongoDB user data fetched:", data);
        setUser(data.user);
        router.refresh(); // Refresh the page after successful login
      } catch (error: any) {
        console.error("Error logging in:", error);
        setErrorMessage('Invalid email or password. Please try again.'); // Show error message
      }
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    console.log("User signed out");
    setUser(null);
    router.push('/login'); // Redirect to login page after signout
  };

  // Show loading indicator if user data is still loading
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
        {user ? (
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
        ) : (
          <>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', marginBottom: '20px' }}>
              {isSignup ? 'Sign Up' : 'Log In'}
            </Typography>
            {errorMessage && (
              <Typography color="error" sx={{ marginBottom: '20px' }}>
                {errorMessage}
              </Typography>
            )}
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
