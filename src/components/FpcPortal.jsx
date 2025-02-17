import React, { useState, useEffect } from "react";
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
import { getSubmissions, createFpcReview, getFileUrl } from "../services/api";

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
      const response = await getSubmissions();
      console.log("Fetched Response:", response);
      
      setApplications(Array.isArray(response) ? response : []);
      setError("");
    } catch (error) {
      setError(error.message || "Failed to fetch submissions");
      console.error("Error fetching submissions:", error);
      setApplications([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };  

  const handleFileView = async (fileUrl) => {
    const { url, headers } = getFileUrl(fileUrl);
  
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": headers.Authorization, 
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch file. Ensure you are logged in.");
      }
  
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
  
      // Open the file in a new tab
      window.open(blobUrl, "_blank");
    } catch (error) {
      console.error("Error viewing file:", error);
      alert("Unable to open file. Please try again.");
    }
  };
  

  const handleActionClick = (app, actionType) => {
    setSelectedApp(app);
    setAction(actionType);
    setRemarks("");
    setError("");
    setOpenDialog(true);
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "Approved":
        return "black";
      case "Rejected":
        return "black"; 
      default:
        return "#000000";
    }
  };

  const validatePdf = (pdfPath) => {
    if (!pdfPath) return "File is required";
    const fileName = pdfPath.split("/").pop();
    if (fileName.includes(" ")) {
      return "File name should not contain spaces.";
    }
    return "";
  };

  const handleSubmit = async () => {
    if (action === "Reject" && !remarks.trim()) {
      setError("Comments are required for rejection");
      return;
    }

    const fpcId = getIdFromToken("fpc");
    if (!fpcId) {
      setError("FPC ID not found");
      return;
    }

    try {
      const reviewData = {
        submission_id: selectedApp.id,
        fpc_id: fpcId,
        status: action,
        comments: remarks.trim()
      };

      await createFpcReview(reviewData);
      await fetchSubmissions();
      
      setOpenDialog(false);
      setRemarks("");
      setSelectedApp(null);
      setError("");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to submit review");
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
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fa",
        padding: 2,
        overflowX: "hidden",
      }}
    >
      <Container
        maxWidth="xl"
        disableGutters
        sx={{
          py: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 5,
            borderRadius: 2,
            width: "95%",
            maxWidth: 1300,
            margin: "0 auto",
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
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
              fontSize: "2.1rem",
            }}
          >
            FPC Portal - Student Applications
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, width: "100%" }}>
              {error}
            </Alert>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#D97C4F" }}>
                  <TableCell sx={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: "1rem" }}>
                    Reg. No.
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: "1rem" }}>
                    Student Name
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: "1rem" }}>
                    Department
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: "1rem" }}>
                    Company
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: "1rem" }}>
                    Offer Type
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: "1rem" }}>
                    Stipend
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: "1rem" }}>
                    Internship Type
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: "1rem" }}>
                    PPO Package (LPA)
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: "1rem" }}>
                    Offer Letter
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: "1rem" }}>
                    Mail Copy
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: "1rem" }}>
                    Actions
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", color: "white", fontWeight: "bold", fontSize: "1rem" }}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center">
                      No applications found
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app) => {
                    const offerLetterError = validatePdf(app.offer_letter_path);
                    const mailCopyError = validatePdf(app.mail_copy_path);
                    return (
                      <TableRow
                        key={app.id}
                        sx={{
                          backgroundColor: app.status === "Approved" ? "#BDE7BD" :
                                         app.status === "Rejected" ? "#FF8E85" :
                                         app.status === "NOC ready" ? "#F7D2C4" :
                                         "inherit",
                        }}
                      >
                        <TableCell sx={{ textAlign: "center", fontSize: "1rem" }}>{app.registration_number}</TableCell>
                        <TableCell sx={{ textAlign: "center", fontSize: "1rem" }}>{app.name}</TableCell>
                        <TableCell sx={{ textAlign: "center", fontSize: "1rem" }}>{app.department}</TableCell>
                        <TableCell sx={{ textAlign: "center", fontSize: "1rem" }}>{app.company_name}</TableCell>
                        <TableCell sx={{ textAlign: "center", fontSize: "1rem" }}>{app.offer_type}</TableCell>
                        <TableCell sx={{ textAlign: "center", fontSize: "1rem" }}>₹{app.stipend_amount}</TableCell>
                        <TableCell sx={{ textAlign: "center", fontSize: "1rem" }}>{app.offer_type_detail}</TableCell>
                        <TableCell sx={{ textAlign: "center", fontSize: "1rem" }}>{app.package_ppo || "-"}</TableCell>
                        <TableCell sx={{ textAlign: "center", fontSize: "1rem" }}>
                          {app.offer_letter_path ? (
                            offerLetterError ? (
                              <Alert severity="error">{offerLetterError}</Alert>
                            ) : (
                              <Button
        onClick={() => handleFileView(app.offer_letter_path)}
        sx={{ textDecoration: 'underline', color: 'primary.main' }}
      >
        View Offer Letter
      </Button>
                            )
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center", fontSize: "1rem" }}>
                          {app.mail_copy_path ? (
                            mailCopyError ? (
                              <Alert severity="error">{mailCopyError}</Alert>
                            ) : (
                              <Button
        onClick={() => handleFileView(app.mail_copy_path)}
        sx={{ textDecoration: 'underline', color: 'primary.main' }}
      >
        View Mail Copy
      </Button>
                            )
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {app.status === "Pending" && (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() => handleActionClick(app, "Approved")}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                size="small"
                                onClick={() => handleActionClick(app, "Rejected")}
                              >
                                Reject
                              </Button>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center", fontSize: "1rem" }}>
                          <Typography sx={{ fontWeight: "bold", color: getStatusTextColor(app.status) }}>
                            {app.status}
                          </Typography>
                        </TableCell>
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
              fontSize: "1.25rem",
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
            sx={{
              p: 2,
              backgroundColor: "#f8f9fa",
              borderTop: "1px solid #ddd",
            }}
          >
            <Button
              onClick={handleSubmit}
              variant="contained"
              color={action === "Approve" ? "success" : "error"}
              sx={{ fontSize: "1rem" }}
            >
              Confirm {action}
            </Button>
            <Button
              onClick={() => setOpenDialog(false)}
              variant="outlined"
              sx={{
                color: "#d05c24",
                borderColor: "#d05c24",
                fontSize: "1rem",
              }}
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