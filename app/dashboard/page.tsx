"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Button,
  Modal,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Grid,
  InputAdornment,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageIcon from "@mui/icons-material/Image";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import { useUser } from "../context/UserContext";

const Dashboard: React.FC = () => {
  const { user, setUser, loading } = useUser();
  const [open, setOpen] = useState(false);
  const [openTextModal, setOpenTextModal] = useState(false); // New state for the text modal
  const [jobDescription, setJobDescription] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOpenTextModal = () => setOpenTextModal(true); // Function to open text modal
  const handleCloseTextModal = () => setOpenTextModal(false); // Function to close text modal

  useEffect(() => {
    if (!loading && user?.applications) {
      setApplications(
        user.applications.sort(
          (a: any, b: any) =>
            new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
        )
      );
      setLoadingApplications(false);
    } else if (!loading) {
      setLoadingApplications(false);
    }
  }, [user, loading]);

  const addApplication = async (jobDescription: string) => {
    setLoadingFeedback(true);
    try {
      const response = await fetch("/api/resume/analyzeText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.userId, jobDescription }),
      });

      if (response.ok) {
        const data = await response.json();

        const newApplication = {
          id: data.id,
          companyName: data.companyName || "Not Specified",
          position: data.position || "Not Specified",
          location: data.location || "Not Specified",
          status: "Application Submitted",
          resumeFeedback: data.resumeFeedback || "",
          coverLetter: "",
          interviewQuestions: [],
          dateCreated: new Date(),
        };

        setApplications((prevApps) => [newApplication, ...prevApps]);

        const userResponse = await fetch(`/api/users/${user.userId}`);
        if (userResponse.ok) {
          const updatedUser = await userResponse.json();
          setUser(updatedUser);
        }

        setFeedback("");
      } else {
        setFeedback("Failed to generate feedback.");
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
      setFeedback("Error generating feedback.");
    } finally {
      setLoadingFeedback(false);
      handleCloseTextModal(); // Close text modal after submission
    }
  };

  const handleDelete = async (applicationId: string) => {
    try {
      const response = await fetch("/api/applications/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.userId, applicationId }),
      });

      if (response.ok) {
        setApplications((prevApps) =>
          prevApps.filter((app) => app.id !== applicationId)
        );
        setUser((prevUser: any) => ({
          ...prevUser,
          applications: prevUser.applications.filter(
            (app: any) => app.id !== applicationId
          ),
        }));
      } else {
        console.error("Failed to delete application in the backend.");
      }
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  const handleStatusChange = async (
    event: React.ChangeEvent<{ value: unknown }>,
    index: number
  ) => {
    const newStatus = event.target.value as string;
    const updatedApplications = [...applications];
    updatedApplications[index].status = newStatus;
    setApplications(updatedApplications);

    try {
      const response = await fetch("/api/applications/updateStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.userId,
          applicationId: updatedApplications[index].id,
          newStatus,
        }),
      });

      if (!response.ok) {
        console.error("Failed to update status in the backend.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading || loadingApplications) {
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

  if (!user) {
    return null;
  }

  const filteredApplications = applications.filter((application) =>
    [application.companyName, application.position, application.location].some(
      (field) => field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #f0f4ff 0%, #fafaff 100%)",
      }}
    >
      {/* Main Box */}
      <Box
        sx={{
          width: "80vw",
          height: "80vh",
          borderRadius: "12px",
          boxShadow: 3,
          bgcolor: "white",
          p: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          marginTop: "20px"
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back,{" "}
          <span style={{ color: "#4C51BF", fontWeight: "bold" }}>
            {user.firstName} {user.lastName}
          </span>
          !
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Ready to enhance your job applications? Manage your profiles and track
          your progress below.
        </Typography>
        {/* Analytics Squares */}
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Box
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px",
                boxShadow: 3,
                bgcolor: "white",
              }}
            >
              <AssignmentIcon sx={{ fontSize: 40, color: "#4C51BF" }} />
              <Typography variant="h6" sx={{ mt: 1 }}>
                {applications.length} Applications
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px",
                boxShadow: 3,
                bgcolor: "white",
              }}
            >
              <PersonSearchIcon sx={{ fontSize: 40, color: "#4C51BF" }} />
              <Typography variant="h6" sx={{ mt: 1 }}>
                {
                  applications.filter((app) => app.status === "Interviewing")
                    .length
                }{" "}
                Interviews
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px",
                boxShadow: 3,
                bgcolor: "white",
              }}
            >
              <ThumbUpAltIcon sx={{ fontSize: 40, color: "#4C51BF" }} />
              <Typography variant="h6" sx={{ mt: 1 }}>
                {
                  applications.filter((app) => app.status === "Received Offer")
                    .length
                }{" "}
                Offers
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Add a Position Button */}
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center", mb: 2, marginTop: "40px" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
            sx={{ backgroundColor: "#4C51BF", mb: 2 }}
          >
            Add a Position
          </Button>
        </Box>

        {/* Search and Analytics */}
        <Box sx={{ width: "100%", mb: 2 }}>
          {/* Search Box */}
          <Box sx={{ mb: 2 }}>
            <TextField
              variant="outlined"
              fullWidth
              placeholder="Search by Company Name, Position, or Location"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ borderRadius: "8px" }}
            />
          </Box>
        </Box>

        {/* Table Box */}
        <Box
          sx={{
            width: "100%",
            flex: 1,
            overflowY: "auto",
            borderRadius: "12px",
            mt: 2,
            bgcolor: "white",
          }}
        >
          <TableContainer
            component={Paper}
            sx={{ borderRadius: "12px", overflow: "hidden", boxShadow: "none" }} // Remove boxShadow from TableContainer
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Company Name</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications.map((application, index) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      {application.companyName || "Not Specified"}
                    </TableCell>
                    <TableCell>
                      {application.position || "Not Specified"}
                    </TableCell>
                    <TableCell>
                      {application.location || "Not Specified"}
                    </TableCell>
                    <TableCell>
                      <FormControl fullWidth>
                        <Select
                          value={application.status}
                          onChange={(e) =>
                            handleStatusChange(e as any, index)
                          }
                          sx={{
                            backgroundColor: "#f0f4ff",
                            borderRadius: "8px",
                          }}
                        >
                          <MenuItem value="Application Submitted">
                            Application Submitted
                          </MenuItem>
                          <MenuItem value="Interviewing">
                            Interviewing
                          </MenuItem>
                          <MenuItem value="Received Offer">
                            Received Offer
                          </MenuItem>
                          <MenuItem value="Accepted Offer">
                            Accepted Offer
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleDelete(application.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* Modal for Adding a Position */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Add a Position
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={4}>
              <Box
                sx={{
                  p: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  boxShadow: 1,
                  bgcolor: "white",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#f0f4ff",
                  },
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 30, color: "#4C51BF" }} />
                <Typography variant="body2">Upload URL</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box
                sx={{
                  p: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  boxShadow: 1,
                  bgcolor: "white",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#f0f4ff",
                  },
                }}
              >
                <ImageIcon sx={{ fontSize: 30, color: "#4C51BF" }} />
                <Typography variant="body2">Upload Image</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box
                sx={{
                  p: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  boxShadow: 1,
                  bgcolor: "white",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#f0f4ff",
                  },
                }}
                onClick={handleOpenTextModal} // Open text modal on click
              >
                <TextFieldsIcon sx={{ fontSize: 30, color: "#4C51BF" }} />
                <Typography variant="body2">Upload Text</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Modal>

      {/* Modal for Upload Text */}
      <Modal open={openTextModal} onClose={handleCloseTextModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Enter Job Description
          </Typography>
          <TextField
            label="Job Description"
            multiline
            rows={4}
            fullWidth
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            sx={{ marginBottom: "20px" }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => addApplication(jobDescription)}
            disabled={loadingFeedback}
            sx={{ backgroundColor: "#4C51BF" }}
          >
            {loadingFeedback ? "Generating..." : "Submit"}
          </Button>
        </Box>
      </Modal>

      {feedback && (
        <Box sx={{ marginTop: "20px" }}>
          <Typography variant="body1" color="textSecondary">
            {feedback}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;
