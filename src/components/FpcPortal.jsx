import React, { useState, useEffect } from "react";
import { getIdFromToken } from "../utils/authUtils";
import ProfileMenu from "./ProfileMenu";
import { Download } from "lucide-react";
import { useMemo } from 'react';
import { TablePagination } from '@mui/material';
import * as XLSX from "xlsx";
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
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

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
          Authorization: headers.Authorization,
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

  const sortedApplications = useMemo(() => {
    return [...applications].sort((a, b) => {
      const statusPriority = {
        Pending: 0,
        Approved: 1,
        Rejected: 2,
      };
      return (
        statusPriority[a.status || "Pending"] -
        statusPriority[b.status || "Pending"]
      );
    });
  }, [applications]);

  const handleSubmit = async () => {
    if (action === "Rejected" && !remarks.trim()) {
      setError("Comments are required for rejection");
      return;
    }

    const fpcId = getIdFromToken("fpc");
    if (!fpcId) {
      setError("FPC ID not found");
      return;
    }
    setConfirmLoading(true);
    try {
      const reviewData = {
        submission_id: selectedApp.id,
        fpc_id: fpcId,
        status: action,
        comments: remarks.trim(),
      };

      await createFpcReview(reviewData);
      await fetchSubmissions();

      setOpenDialog(false);
      setRemarks("");
      setSelectedApp(null);
      setError("");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to submit review");
    } finally {
      setConfirmLoading(false);
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

  const handleDownloadExcel = () => {
    // Filter only approved submissions
    const approvedSubmissions = applications.filter(
      (app) => app.status === "Approved"
    );

    // Prepare data for Excel
    const excelData = approvedSubmissions.map((app) => ({
      "Registration Number": app.registration_number,
      "Student Name": app.name,
      Department: app.department,
      Company: app.company_name,
      "Offer Type": app.offer_type,
      Stipend: app.stipend,
      "Internship Type": app.internship_type,
      "PPO Package": app.ppo_package,
      "Start Date": app.start_date,
      "End Date": app.end_date,
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Approved Applications");

    // Generate Excel file
    XLSX.writeFile(wb, "approved_applications.xlsx");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        overflow: "hidden",
        position: "initial",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <ProfileMenu userRole="fpc" />

      <Container
        maxWidth={false}
        sx={{
          height: "100%",
          py: 4,
          px: 3,
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
            width: "100%",
            maxWidth: "1400px",
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflow: "hidden",
            maxHeight: "90vh",
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

          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<Download size={20} />}
              onClick={handleDownloadExcel}
              sx={{
                backgroundColor: "#d05c24",
                "&:hover": {
                  backgroundColor: "#bf4e1f",
                },
              }}
            >
              Download Approved Applications
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, width: "100%" }}>
              {error}
            </Alert>
          )}

          <TableContainer
            component={Paper}
            sx={{
              maxWidth: "100%",
              overflow: "auto",
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#D97C4F" }}>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    Reg. No.
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    Student Name
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    Department
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    Company
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    Offer Type
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    Stipend
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    Internship Type
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    PPO Package (LPA)
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    Offer Letter
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    Mail Copy
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    Actions
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
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
                  sortedApplications
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((app) => {
                      const offerLetterError = validatePdf(
                        app.offer_letter_path
                      );
                      const mailCopyError = validatePdf(app.mail_copy_path);
                      return (
                        <TableRow
                          key={app.id}
                          sx={{
                            backgroundColor:
                              app.status === "Approved"
                                ? "#BDE7BD"
                                : app.status === "Rejected"
                                ? "#FF8E85"
                                : app.status === "NOC ready"
                                ? "#F7D2C4"
                                : "inherit",
                          }}
                        >
                          <TableCell
                            sx={{ textAlign: "center", fontSize: "1rem" }}
                          >
                            {app.registration_number}
                          </TableCell>
                          <TableCell
                            sx={{ textAlign: "center", fontSize: "1rem" }}
                          >
                            {app.name}
                          </TableCell>
                          <TableCell
                            sx={{ textAlign: "center", fontSize: "1rem" }}
                          >
                            {app.department}
                          </TableCell>
                          <TableCell
                            sx={{ textAlign: "center", fontSize: "1rem" }}
                          >
                            {app.company_name}
                          </TableCell>
                          <TableCell
                            sx={{ textAlign: "center", fontSize: "1rem" }}
                          >
                            {app.offer_type}
                          </TableCell>
                          <TableCell
                            sx={{ textAlign: "center", fontSize: "1rem" }}
                          >
                            ₹{app.stipend_amount}
                          </TableCell>
                          <TableCell
                            sx={{ textAlign: "center", fontSize: "1rem" }}
                          >
                            {app.offer_type_detail}
                          </TableCell>
                          <TableCell
                            sx={{ textAlign: "center", fontSize: "1rem" }}
                          >
                            {app.package_ppo || "-"}
                          </TableCell>
                          <TableCell
                            sx={{ textAlign: "center", fontSize: "1rem" }}
                          >
                            {app.offer_letter_path ? (
                              offerLetterError ? (
                                <Alert severity="error">
                                  {offerLetterError}
                                </Alert>
                              ) : (
                                <Button
                                  onClick={() =>
                                    handleFileView(app.offer_letter_path)
                                  }
                                  sx={{
                                    textDecoration: "underline",
                                    color: "primary.main",
                                  }}
                                >
                                  View Offer Letter
                                </Button>
                              )
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell
                            sx={{ textAlign: "center", fontSize: "1rem" }}
                          >
                            {app.mail_copy_path ? (
                              mailCopyError ? (
                                <Alert severity="error">{mailCopyError}</Alert>
                              ) : (
                                <Button
                                  onClick={() =>
                                    handleFileView(app.mail_copy_path)
                                  }
                                  sx={{
                                    textDecoration: "underline",
                                    color: "primary.main",
                                  }}
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
                                  onClick={() =>
                                    handleActionClick(app, "Approved")
                                  }
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="contained"
                                  color="error"
                                  size="small"
                                  onClick={() =>
                                    handleActionClick(app, "Rejected")
                                  }
                                >
                                  Reject
                                </Button>
                              </Box>
                            )}
                          </TableCell>
                          <TableCell
                            sx={{ textAlign: "center", fontSize: "1rem" }}
                          >
                            <Typography
                              sx={{
                                fontWeight: "bold",
                                color: getStatusTextColor(app.status),
                              }}
                            >
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
          <TablePagination
            component="div"
            count={applications.length}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10]}
            sx={{
              ".MuiTablePagination-select": {
                color: "#d05c24",
              },
              ".MuiTablePagination-displayedRows": {
                color: "#666",
              },
            }}
          />
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
              disabled={confirmLoading}
              variant="contained"
              color={action === "Approve" ? "success" : "error"}
              sx={{ fontSize: "1rem" }}
            >
              {confirmLoading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: "#d05c24" }} />
                  <span>Processing...</span>
                </Box>
              ) : (
                `Confirm ${action}`
              )}
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
