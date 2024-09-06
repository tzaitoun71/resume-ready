"use client";

import React, { useState } from "react";
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
} from "firebase/auth";
import { auth } from "../firebase"; // Import Firebase configuration
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";

const primaryColor = "#4C51BF";

const LoginPage: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user, setUser, loading } = useUser(); // Use context to manage user state
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSignup) {
      // Sign up logic
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const newUser = userCredential.user;

        if (newUser) {
          // Send user data to your signup endpoint to store in MongoDB
          const response = await fetch("/api/users/signup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: newUser.uid,
              email,
              firstName,
              lastName,
            }),
          });

          if (!response.ok) throw new Error("Failed to save user data in MongoDB");

          // Fetch the user data after successful signup and storage
          const userData = await fetchUserData(newUser.uid);
          setUser(userData); // Update context with user data

          router.push("/dashboard");
        }
      } catch (error: any) {
        console.error("Error signing up:", error);
        setErrorMessage(error.message); // Show error message
      }
    } else {
      // Login logic
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const loggedInUser = userCredential.user;

        if (loggedInUser) {
          const userData = await fetchUserData(loggedInUser.uid);
          setUser(userData); // Update context with user data

          router.push("/dashboard");
        }
      } catch (error: any) {
        console.error("Error logging in:", error);
        setErrorMessage("Invalid email or password. Please try again."); // Show error message
      }
    }
  };

  const fetchUserData = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch user data");
      }
      const userData = await res.json();
      console.log("Fetched User Data:", userData);
      return userData; // Return fetched user data
    } catch (error) {
      console.error("Error fetching user data:", error);
      setErrorMessage("Error fetching user data.");
      return null; // Return null if fetching fails
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    console.log("User signed out");
    setUser(null);
    router.push("/login"); // Redirect to login page after signout
  };

  // Show loading indicator if user data is still loading
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
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
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        background: "linear-gradient(135deg, #f0f4ff 0%, #fafaff 100%)",
        padding: { xs: "10px", md: "20px" }, // Responsive padding
        boxSizing: "border-box",
        overflowY: "hidden", // Ensure scrolling if content overflows
        
      }}
    >
      {/* Centering Wrapper for the form */}
      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: "90%", sm: "400px", md: "500px" }, // Responsive width
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexGrow: 1,
          marginBottom: { xs: 2, sm: 4 }, // Add margin top for space on smaller screens
        }}
      >
        {/* Header Section */}
        <Box sx={{ mt: { xs: "30px", sm: "20px" } }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: "bold",
              color: "#333",
              //marginBottom: "20px",
              fontSize: { xs: "2rem", md: "3rem" }, // Responsive font size
            }}
          >
            ResumeReady
          </Typography>
          <Typography
            variant="h6"
            color="textSecondary"
            sx={{
              color: "#555",
              marginBottom: "20px",
              fontSize: { xs: "1rem", md: "1.25rem" }, // Responsive font size
            }}
          >
            The easiest way to optimize your job applications and stand out.
          </Typography>
        </Box>

        {/* Login/Signup Form Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            marginBottom: "20px",
            width: "100%",
            maxWidth: "400px",
            maxHeight: "60vh", // Set maximum height
            overflowY: "auto", // Enable vertical scrolling inside the form
            transition: "max-height 0.3s ease",
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
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", color: "#333", marginBottom: "20px" }}
              >
                {isSignup ? "Sign Up" : "Log In"}
              </Typography>
              {errorMessage && (
                <Typography color="error" sx={{ marginBottom: "20px" }}>
                  {errorMessage}
                </Typography>
              )}
              {isSignup && (
                <Grid container spacing={2} sx={{ marginBottom: "20px" }}>
                  <Grid item xs={6}>
                    <TextField
                      label="First Name"
                      type="text"
                      fullWidth
                      variant="outlined"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Last Name"
                      type="text"
                      fullWidth
                      variant="outlined"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </Grid>
                </Grid>
              )}
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ marginBottom: "20px" }}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ marginBottom: "20px" }}
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
                {isSignup ? "Sign Up" : "Log In"}
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
                {isSignup
                  ? "Already have an account? Log In"
                  : "Don't have an account? Sign Up"}
              </Button>
            </>
          )}
        </Box>
      </Box>


      {/* Features Section */}
      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignItems="stretch"
        sx={{
          maxWidth: { xs: "100%", sm: "600px", md: "900px" }, // Adjust max width for different screen sizes
          width: "100%",
          px: 2, // Add horizontal padding for smaller screens
          flexGrow: 1, // Allow the grid to take up remaining space
          overflowY: "auto", // Allow scrolling if content overflows
          height: "auto", // Ensure it adapts to screen size
          mb: "calc(5vh + 100px)", // Responsive margin-bottom using calc
        }}
      >
        {/* Feature Boxes */}
        <Grid item xs={12} sm={6} md={3} sx={{ display: "flex" }}>
        <Paper
          elevation={3}
          sx={{
            padding: "20px",
            textAlign: "center",
            borderRadius: "12px",
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: { xs: "200px", md: "250px" }, // Adjust height for different screen sizes
            width: "100%",
          }}
        >
            <CheckCircleOutlineIcon sx={{ fontSize: 40, color: primaryColor }} />
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
              padding: "20px",
              textAlign: "center",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "250px",
              width: "100%",
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
              padding: "20px",
              textAlign: "center",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "250px",
              width: "100%",
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
              padding: "20px",
              textAlign: "center",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "250px",
              width: "100%",
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
    </Container>
  );
};

export default LoginPage;
