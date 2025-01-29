import { useState, useEffect } from "react";
import { getIdFromToken } from "../utils/authUtils";

import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { getSubmissions, createReview } from "../services/api";

function FpcPortal() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await getSubmissions();
      console.log("Fetched Submissions:", data); // Log fetched data for debugging
      // Ensure the response is an array before setting it
      if (Array.isArray(data)) {
        setApplications(data); // Set applications if data is valid
      } else {
        throw new Error("Invalid data format"); // Handle invalid data format
      }
      setError(""); // Clear any previous errors
    } catch (error) {
      setError("Failed to fetch submissions");
      console.error("Error fetching submissions:", error); // Log detailed error
      setApplications([]); // Clear applications on error
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (app, actionType) => {
    setSelectedApp(app);
    setAction(actionType);
    if (actionType === "Approve") {
      setRemarks(""); // No comment is required for approve action
    }
    setOpenDialog(true);
    setError("");
  };

  const validatePdf = (pdfPath) => {
    // Validate file size and check for spaces in filename
    const fileName = pdfPath.split("/").pop(); // Extract file name from path
    if (fileName.includes(" ")) {
      return "File name should not contain spaces.";
    }
    return ""; // Return empty if validation passes
  };

  const handleSubmit = async () => {
    // Validate comment for reject/rework actions
    if (action === "Reject" && !remarks.trim()) {
      setError("Comments are required for reject actions");
      return;
    }

    // Get fpc or HOD ID based on role
    const fpcId = getIdFromToken("fpc"); // Use the utility function to fetch fpc ID
    if (!fpcId) {
      setError("Failed to fetch fpc ID");
      return;
    }

    // Construct the review data
    const reviewData = {
      submission_id: selectedApp.id,
      fpc_id: fpcId, // Use the fetched fpc ID
      status:
        action === "Approve"
          ? "Approved"
          :"Rejected"
          ? "Rejected"
          : "Rework",
      comments: action === "Approve" ? "" : remarks.trim(),
    };

    console.log("Review Data:", reviewData);

    try {
      await createReview(reviewData);
      setOpenDialog(false);
      setRemarks("");
      setSelectedApp(null);
      setError("");
    } catch (error) {
      console.error("Error submitting review:", error);
      setError(error.response?.data?.error || "Failed to submit review");
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
     
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
  sx={{
    minHeight: "140vh",
        minWidth: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        mt:-45,
    backgroundColor: "#f8f9fa", // Full gray background
    padding: 2,
  }}
>
    <Container
      maxWidth="lg" disableGutters
      sx={{
        py: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      <Paper
      elevation={3}
      sx={{
        p: 4,
        borderRadius: 2,
        maxWidth: 1200,
        margin: "0 auto", // Center align
        backgroundColor: "#fff", // Keep the Paper white
      }}
      >
        <Typography
          variant="h4"
          gutterBottom
          color="primary"
          sx={{
            mb: 4,
            fontWeight: "bold",
            textAlign: "center",
            color: "#d05c24",
          }}
        >
          FPC Portal - Student Applications
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#D97C4F" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Reg. No.
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Student Name
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Department
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Company
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Offer Type
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Stipend
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Actions
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Offer Letter
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Mail Copy
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No applications found
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app) => {
                  const offerLetterError = validatePdf(app.offer_letter_path); // Validation for offer letter
                  const mailCopyError = validatePdf(app.mail_copy_path);
                  return (
                    <TableRow key={app.id}>
                      <TableCell>{app.registration_number}</TableCell>
                      <TableCell>{app.name}</TableCell>
                      <TableCell>{app.department}</TableCell>
                      <TableCell>{app.company_name}</TableCell>
                      <TableCell>{app.offer_type}</TableCell>
                      <TableCell>₹{app.stipend_amount}</TableCell>
                      <TableCell>
                        {offerLetterError ? (
                          <Alert severity="error">{offerLetterError}</Alert>
                        ) : (
                          <a
                            href={app.offer_letter_path}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Offer Letter
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        {mailCopyError ? (
                          <Alert severity="error">{mailCopyError}</Alert>
                        ) : (
                          <a
                            href={app.mail_copy_path}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Mail Copy
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleActionClick(app, "Approve")}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleActionClick(app, "Reject")}
                          >
                            Reject
                          </Button>
                        </Box>
                      </TableCell>
                      <TableCell>{app.status}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            p: 2,
            backgroundColor: "#fff",
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#d05c24",
            color: "white",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Review Application
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Comments"
            multiline
            rows={4}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            required={action === "Reject" || action === "Rework"}
            error={Boolean(error)}
            helperText={error}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions
          sx={{ p: 2, backgroundColor: "#f8f9fa", borderTop: "1px solid #ddd" }}
        >
          <Button
            onClick={handleSubmit}
            variant="contained"
            color={
              action === "Approve"
                ? "success"
                : action === "Reject"
                ? "error"
                : "warning"
            }
          >
            Confirm {action}
          </Button>
          <Button
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            sx={{ color: "#d05c24", borderColor: "#d05c24" }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </Box>
  );
}

export default FpcPortal;