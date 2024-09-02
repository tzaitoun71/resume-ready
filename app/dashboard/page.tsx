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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ImageIcon from "@mui/icons-material/Image";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import AddIcon from "@mui/icons-material/Add";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";

const Dashboard: React.FC = () => {
  const { user, setUser, loading } = useUser();
  const [open, setOpen] = useState(false);
  const [openTextModal, setOpenTextModal] = useState(false);
  const [openImageModal, setOpenImageModal] = useState(false); // Modal state for image upload
  const [jobDescription, setJobDescription] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter(); // Initialize router

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOpenTextModal = () => setOpenTextModal(true);
  const handleCloseTextModal = () => setOpenTextModal(false);

  const handleOpenImageModal = () => setOpenImageModal(true);
  const handleCloseImageModal = () => {
    setOpenImageModal(false);
    setUploadedImage(null);
    setImagePreviewUrl(null);
  };

  useEffect(() => {
    if (!loading && user?.applications) {
      setApplications(
        user.applications.sort(
          (a: any, b: any) =>
            new Date(b.dateCreated).getTime() -
            new Date(a.dateCreated).getTime()
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
      handleCloseTextModal();
    }
  };

  const handleDelete = async (
    event: React.MouseEvent,
    applicationId: string
  ) => {
    event.stopPropagation(); // Prevent the click event from bubbling up to the row
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
    event.stopPropagation(); // Prevent the click event from bubbling up to the row
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

  const navigateToJobDetails = (userId: string, jobId: string) => {
    router.push(`/${userId}_${jobId}`);
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault(); // Prevent the default paste behavior to avoid inserting image in the text area.

    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") === 0) {
        const blob = item.getAsFile();
        if (blob) {
          setUploadedImage(blob);
          setImagePreviewUrl(URL.createObjectURL(blob)); // Set image preview
        }
      }
    }
  };

  const handleImageSubmit = async () => {
    if (!uploadedImage) return;

    setLoadingFeedback(true); // Set loading state
    try {
      const formData = new FormData();
      formData.append("file", uploadedImage);
      formData.append("userId", user.userId); // Append userId correctly

      const response = await fetch("/api/resume/uploadImage", {
        method: "POST",
        body: formData,
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
      console.error("Error uploading image:", error);
      setFeedback("Error uploading image.");
    } finally {
      setLoadingFeedback(false); // Reset loading state
      handleCloseImageModal();
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

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Intl.DateTimeFormat("en-US", options).format(new Date(date));
  };

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        background: "linear-gradient(135deg, #f0f4ff 0%, #fafaff 100%)",
        paddingTop: isSmallScreen ? "60px" : "80px",
        boxSizing: "border-box",
        overflow: "auto",
      }}
    >
      {/* Main Box */}
      <Box
        sx={{
          width: isSmallScreen ? "95%" : "80%",
          maxWidth: "1400px",
          minWidth: isSmallScreen ? "90%" : "80%",
          height: isSmallScreen ? "auto" : "85vh", // Adjust height based on screen size
          maxHeight: "90vh", // Set a maximum height
          borderRadius: "8px",
          boxShadow: 2,
          bgcolor: "white",
          p: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          marginTop: isSmallScreen ? "10px" : "20px",
          overflow: "hidden",
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          Welcome back,{" "}
          <span style={{ color: "#4C51BF", fontWeight: "bold" }}>
            {user.firstName} {user.lastName}
          </span>
          !
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Ready to enhance your job applications? Manage your profiles and track
          your progress below.
        </Typography>

        {/* Analytics Squares */}
        <Grid container spacing={isSmallScreen ? 1 : 2} justifyContent="center">
          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                p: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                boxShadow: 2,
                bgcolor: "white",
                height: isSmallScreen ? "80px" : "100px",
                margin: isSmallScreen ? "5px" : "10px",
              }}
            >
              <AssignmentIcon
                sx={{ fontSize: isSmallScreen ? 25 : 30, color: "#4C51BF" }}
              />
              <Typography variant="subtitle1" sx={{ mt: 0.5 }}>
                {applications.length} Applications
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                p: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                boxShadow: 2,
                bgcolor: "white",
                height: isSmallScreen ? "80px" : "100px",
                margin: isSmallScreen ? "5px" : "10px",
              }}
            >
              <PersonSearchIcon
                sx={{ fontSize: isSmallScreen ? 25 : 30, color: "#4C51BF" }}
              />
              <Typography variant="subtitle1" sx={{ mt: 0.5 }}>
                {
                  applications.filter((app) => app.status === "Interviewing")
                    .length
                }{" "}
                Interviews
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                p: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                boxShadow: 2,
                bgcolor: "white",
                height: isSmallScreen ? "80px" : "100px",
                margin: isSmallScreen ? "5px" : "10px",
              }}
            >
              <ThumbUpAltIcon
                sx={{ fontSize: isSmallScreen ? 25 : 30, color: "#4C51BF" }}
              />
              <Typography variant="subtitle1" sx={{ mt: 0.5 }}>
                {
                  applications.filter(
                    (app) =>
                      app.status === "Received Offer" ||
                      app.status === "Accepted Offer"
                  ).length
                }{" "}
                Offers
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Add a Position Button */}
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            mb: 2,
            mt: 2,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
            sx={{ backgroundColor: "#4C51BF", mb: 1 }}
            startIcon={<AddIcon />}
          >
            Add a Position
          </Button>
        </Box>

        {/* Search and Table */}
        <Box sx={{ width: "100%", mb: 1 }}>
          {/* Search Box */}
          <Box sx={{ mb: 1 }}>
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
                sx: {
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#4C51BF", // Purple outline on focus
                  },
                },
              }}
              sx={{ borderRadius: "8px" }}
            />
          </Box>
        </Box>

        {/* Table Box */}
        <Box
          sx={{
            width: "100%",
            maxHeight: "calc(100% - 260px)", // dynamically adjust max height based on screen size
            overflowY: "auto",
            borderRadius: "8px",
            bgcolor: "white",
          }}
        >
          <TableContainer
            component={Paper}
            sx={{ borderRadius: "8px", overflow: "hidden", boxShadow: "none" }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ py: 1 }}>Company Name</TableCell>
                  <TableCell sx={{ py: 1 }}>Position</TableCell>
                  <TableCell sx={{ py: 1 }}>Location</TableCell>
                  <TableCell sx={{ py: 1 }}>Date Created</TableCell>
                  <TableCell sx={{ py: 1 }}>Status</TableCell>
                  <TableCell sx={{ py: 1 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications.map((application, index) => (
                  <TableRow
                    key={application.id}
                    sx={{
                      cursor: "pointer", // Change cursor on hover
                      "&:hover": { backgroundColor: "#f0f4ff" }, // Change background color on hover
                    }}
                    onClick={() =>
                      navigateToJobDetails(user.userId, application.id)
                    } // Navigate on click
                  >
                    <TableCell sx={{ py: 1 }}>
                      {application.companyName || "Not Specified"}
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      {application.position || "Not Specified"}
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      {application.location || "Not Specified"}
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      {formatDate(application.dateCreated)}
                    </TableCell>
                    <TableCell
                      sx={{ py: 1 }}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <FormControl fullWidth>
                        <Select
                          value={application.status}
                          onChange={(e) => handleStatusChange(e as any, index)}
                          sx={{
                            backgroundColor: "#f0f4ff",
                            borderRadius: "8px",
                            height: "30px",
                            fontSize: "0.875rem",
                          }}
                        >
                          <MenuItem value="Application Submitted">
                            Application Submitted
                          </MenuItem>
                          <MenuItem value="Interviewing">Interviewing</MenuItem>
                          <MenuItem value="Received Offer">
                            Received Offer
                          </MenuItem>
                          <MenuItem value="Accepted Offer">
                            Accepted Offer
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell
                      sx={{ py: 1 }}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <IconButton
                        onClick={(event) => handleDelete(event, application.id)}
                        color="error"
                        sx={{
                          cursor: "default", // Change cursor back to default for delete button
                        }}
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
            width: "90%",
            maxWidth: 450, // Increase modal width
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 3,
            borderRadius: "8px",
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Add a Position
          </Typography>
          <Grid container spacing={1} justifyContent="center">
            <Grid item xs={6}>
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
                onClick={handleOpenImageModal} // Open Image Modal on click
              >
                <ImageIcon sx={{ fontSize: 25, color: "#4C51BF" }} />
                <Typography variant="body2">Upload Image</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
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
                onClick={handleOpenTextModal}
              >
                <TextFieldsIcon sx={{ fontSize: 25, color: "#4C51BF" }} />
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
            width: "90%",
            maxWidth: 400, // Match the width of the image modal
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 3,
            borderRadius: "8px",
            textAlign: "center", // Center the text within the modal
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Enter Job Description
          </Typography>

          {/* Job Description Text Field */}
          <TextField
            label="Job Description"
            multiline
            rows={4}
            fullWidth
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            sx={{
              mb: 2, // Use consistent margin with the image modal
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px", // Rounded corners like the image paste area
              },
            }}
          />

          {/* Submit Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={() => addApplication(jobDescription)}
            disabled={loadingFeedback}
            fullWidth
            sx={{
              backgroundColor: "#4C51BF", // Match the color scheme of the other modal
              "&:hover": {
                backgroundColor: "#3a42b1", // Slightly darker shade on hover
              },
            }}
          >
            {loadingFeedback ? "Generating..." : "Submit"}
          </Button>
        </Box>
      </Modal>

      {/* Modal for Upload Image */}
      <Modal open={openImageModal} onClose={handleCloseImageModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 3,
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Paste an Image
          </Typography>

          {/* Paste Area */}
          <Box
            component="div"
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "1px dashed #4C51BF",
              borderRadius: "8px",
              p: 2,
              minHeight: "50px",
              cursor: "text",
              overflow: "hidden",
              textAlign: "center",
              backgroundColor: "#f9f9f9",
            }}
            contentEditable // Allow the div to be editable to enable right-click paste
            onPaste={handlePaste} // Handle pasting
          >
            <Typography variant="body2" color="textSecondary">
              Ctrl + V or right-click to paste an image
            </Typography>
          </Box>

          {/* Image Preview */}
          {imagePreviewUrl && (
            <Box
              sx={{
                mb: 2,
                display: "flex",
                justifyContent: "center", // Center the container horizontally
                border: "1px dashed #4C51BF",
                borderRadius: "8px",
                p: 1,
                maxWidth: "100px", // Set a fixed width to ensure centering
                margin: "0 auto", // Center the box itself within the modal
              }}
            >
              <img
                src={imagePreviewUrl}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  objectFit: "contain",
                  marginBottom: "20px",
                }} // Adjust max width and object-fit
              />
            </Box>
          )}

          {/* Submit Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleImageSubmit}
            disabled={!uploadedImage || loadingFeedback} // Disable while loading
            fullWidth
            sx={{ backgroundColor: "#4C51BF", marginTop: "20px" }}
          >
            {loadingFeedback ? "Submitting..." : "Submit Image"}{" "}
            {/* Show loading text */}
          </Button>
        </Box>
      </Modal>

      {feedback && (
        <Box sx={{ marginTop: "10px" }}>
          <Typography variant="body2" color="textSecondary">
            {feedback}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;
