"use client";

import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Modal,
  Paper,
  Divider,
} from "@mui/material";
import { useRouter } from "next/navigation";
import LogoutIcon from "@mui/icons-material/Logout";
import ContactPageIcon from "@mui/icons-material/ContactPage";
import { useUser } from "../context/UserContext"; // Import your UserContext hook
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; // Import Firebase auth

const Navbar: React.FC = () => {
  const router = useRouter();
  const { signOutUser, user } = useUser(); // Use signOutUser function from context
  const [openModal, setOpenModal] = useState(false); // State to control modal open/close

  const handleLogout = async () => {
    try {
      await signOut(auth); // Log out from Firebase
      signOutUser(); // Update context and redirect to login page
      console.log("User logged out");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleBuyNow = () => {
    setOpenModal(true); // Open the modal when "Buy Now" is clicked
  };

  const handleCloseModal = () => {
    setOpenModal(false); // Close the modal
  };

  const handleCheckout = async () => {
    try {
      const response = await fetch("/api/plus/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.userId }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe checkout page
      }
    } catch (error) {
      console.error("Error initiating checkout:", error);
    }
  };

  return (
    <>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={1}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            backgroundColor: "#ffffff",
            padding: "10px 30px",
          }}
        >
          {/* Logo or Title */}
          <Box
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={() => router.push("/dashboard")}
          >
            <ContactPageIcon sx={{ color: "#4C51BF" }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#333", marginLeft: "10px" }}
            >
              ResumeReady
            </Typography>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Button
              color="inherit"
              onClick={() => router.push("/dashboard")}
              sx={{ marginRight: "20px", color: "#333" }}
            >
              Dashboard
            </Button>
            <Button
              color="inherit"
              onClick={() => router.push("/resume")}
              sx={{ marginRight: "20px", color: "#333" }}
            >
              Resume
            </Button>
            {/* Show the Buy Now button only if the user does not have a "plus" membership */}
            {user?.membership !== "plus" && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleBuyNow}
                sx={{
                  backgroundColor: "#4C51BF",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: "30px",
                  marginRight: "20px",
                  "&:hover": {
                    backgroundColor: "#3b3f7a",
                  },
                }}
              >
                Buy Now
              </Button>
            )}
            <IconButton
              color="inherit"
              onClick={handleLogout}
              sx={{ color: "#333" }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Modal for Buy Now */}
      {/* Modal for Buy Now */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          component={Paper}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 450,
            padding: 4,
            borderRadius: 2,
            boxShadow: 3,
            backgroundColor: "#f7f9fc",
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{
              marginBottom: 2,
              color: "#4C51BF",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            Unlock Premium Features
          </Typography>
          <Divider sx={{ marginBottom: 2 }} />
          <Typography variant="body1" sx={{ marginBottom: 2, color: "#333" }}>
            Elevate your job application game with our exclusive{" "}
            <strong>ResumeReady Plus Membership</strong>! Gain access to:
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: 1, color: "#555" }}>
            • A professionally crafted <strong>cover letter</strong> that
            showcases your strengths and aligns perfectly with the job you’re
            applying for.
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: 1, color: "#555" }}>
            • Expertly designed <strong>behavioral interview questions</strong>{" "}
            tailored to prepare you for the toughest interview scenarios.
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: 1, color: "#555" }}>
            • Comprehensive <strong>technical interview questions</strong> to
            sharpen your skills and boost your confidence.
          </Typography>
          <Divider sx={{ marginBottom: 2 }} />
          <Typography
            variant="body2"
            sx={{ marginBottom: 2, color: "#777", textAlign: "center" }}
          >
            All these amazing resources for just a{" "}
            <strong>one-time payment</strong> of <strong>$9.99</strong>! Take
            the next step in your career journey.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCheckout}
            fullWidth
            sx={{
              backgroundColor: "#4C51BF",
              color: "#fff",
              padding: "10px 0",
              fontSize: "16px",
              fontWeight: "bold",
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#3b3f7a",
              },
            }}
          >
            Buy for $9.99
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default Navbar;
