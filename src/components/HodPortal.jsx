import { useState, useEffect } from "react";
import { getIdFromToken, getEmailFromToken } from "../utils/authUtils";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import ProfileMenu from "./ProfileMenu";
import { Tabs, Tab } from "@mui/material";
import HodAnalytics from "./HodAnalytics";
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
import {
  getApprovedSubmissions,
  createHodReview,
  getFileUrl,
} from "../services/api";

function HodPortal() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("");
  const [hodEmail, setHodEmail] = useState("");
  const [offerLetterError, setOfferLetterError] = useState("");
  const [mailCopyError, setMailCopyError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  useEffect(() => {
    fetchApprovedSubmissions();
    const email = getEmailFromToken();
    if (email) {
      setHodEmail(email);
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const fetchApprovedSubmissions = async () => {
    try {
      const response = await getApprovedSubmissions();
      if (Array.isArray(response)) {
        setApplications(response);
      } else {
        throw new Error("Invalid data format");
      }
      setError("");
    } catch (error) {
      setError("Failed to fetch submissions");
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const sortedApplications = useMemo(() => {
    return [...applications].sort((a, b) => {
      const statusPriority = {
        Pending: 0,
        Approved: 1,
        Rejected: 2,
      };
      return (
        statusPriority[a.hod_status || "Pending"] -
        statusPriority[b.hod_status || "Pending"]
      );
    });
  }, [applications]);

  const handleFileView = async (fileUrl) => {
    if (actionLoading) return;
    setActionLoading(true);
    const { url, headers } = getFileUrl(fileUrl);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: headers.Authorization,
      },
    });

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

      setOfferLetterError("");
      setMailCopyError("");
    } catch (error) {
      console.error("Error viewing file:", error);
      // Set appropriate error based on the file type
      if (fileUrl.includes("offer_letter")) {
        setOfferLetterError("Error loading file");
      } else if (fileUrl.includes("mail_copy")) {
        setMailCopyError("Error loading file");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const isButtonDisabled = (app) => {
    // If HOD email is shushilavishnoi@gmail.com, only disable buttons when status is "NOC ready"
    if (hodEmail === "shusheelavishnoi@gmail.com") {
      return app.status === "NOC ready";
    }
    // For other HODs, maintain original logic
    return (
      !app.status ||
      app.status === "Pending" ||
      app.status === "Rejected" ||
      app.status === "NOC ready"
    );
  };

  const handleAction = async (app, actionType) => {
    setSelectedApp(app);
    setAction(actionType);
    setOpenDialog(true);
    setError("");
  };

  const handleSubmit = async () => {
    if (action === "Rejected" && !remarks.trim()) {
      setError("Comments are required for rejection");
      return;
    }

    const hodId = getIdFromToken("hod");
    if (!hodId) {
      setError("HOD ID not found");
      return;
    }
    setConfirmLoading(true);
    try {
      await createHodReview({
        submission_id: selectedApp.id,
        hod_id: hodId,
        status: action,
        comments: remarks.trim(),
      });

      setApplications((prevApps) =>
        prevApps.map((app) =>
          app.id === selectedApp.id ? { ...app, status: action } : app
        )
      );

      setOpenDialog(false);
      setRemarks("");
      setSelectedApp(null);
      setError("");

      await fetchApprovedSubmissions();
    } catch (error) {
      setError("Failed to submit review");
      console.error("Error submitting review:", error);
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
    // Filter only NOC-ready submissions (approved by FPC)
    const nocReadySubmissions = applications.filter(
      (app) => app.fpc_status === "Approved"
    );

    // Prepare data for Excel
    const excelData = nocReadySubmissions.map((app) => ({
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
      "FPC Comments": app.fpc_comments || "No comments",
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "NOC Ready Applications");

    // Generate Excel file
    XLSX.writeFile(wb, "noc_ready_applications.xlsx");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
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
      <ProfileMenu userRole="hod" />
      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        sx={{
          mb: 3,
          "& .MuiTab-root": {
            color: "#666",
            "&.Mui-selected": {
              color: "#d05c24",
            },
          },
          "& .MuiTabs-indicator": {
            backgroundColor: "#d05c24",
          },
        }}
      >
        <Tab label="Applications" />
        <Tab label="Analytics" />
      </Tabs>

      {currentTab === 0 ? (
        <Container
          maxWidth={false}
          sx={{
            height: "100%",
            width: "100vw",
            py: 4,
            px: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f8f9fa",
            overflow: "hidden",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              width: "100%",
              maxWidth: "1500px",
              backgroundColor: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              overflow: "hidden",
              maxHeight: "100%",
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                mb: 4,
                fontWeight: "bold",
                textAlign: "center",
                color: "#d05c24",
                fontSize: "2.1rem",
              }}
            >
              HOD Portal - Application Review
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
                Download NOC Ready Applications
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
                "& .MuiTableCell-root": {
                  // Add this to reduce cell padding
                  padding: "8px 4px",
                  fontSize: "0.875rem", // Reduce font size
                  whiteSpace: "nowrap",
                },
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "#D97C4F",
                      justifyContent: "center",
                    }}
                  >
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        minWidth: "50px",
                      }}
                    >
                      Reg. No.
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        minWidth: "40px",
                      }}
                    >
                      Student Name
                    </TableCell>

                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        minWidth: "40px",
                      }}
                    >
                      Company
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        minWidth: "40px",
                      }}
                    >
                      Offer Type
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        minWidth: "40px",
                      }}
                    >
                      Internship Type
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        minWidth: "40px",
                      }}
                    >
                      PPO Package
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        minWidth: "40px",
                      }}
                    >
                      Stipend
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        minWidth: "40px",
                      }}
                    >
                      Start Date
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        minWidth: "30px",
                      }}
                    >
                      End Date
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        minWidth: "30px",
                      }}
                    >
                      Offer Letter
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        minWidth: "30px",
                      }}
                    >
                      Mail Copy
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        minWidth: "30px",
                      }}
                    >
                      FPC Status
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        minWidth: "80px",
                      }}
                    >
                      Actions
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        minWidth: "50px",
                      }}
                    >
                      NOC Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedApplications
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((app) => (
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
                        <TableCell>{app.registration_number}</TableCell>
                        <TableCell>{app.name}</TableCell>

                        <TableCell>{app.company_name}</TableCell>
                        <TableCell>{app.offer_type}</TableCell>
                        <TableCell>{app.offer_type_detail}</TableCell>
                        <TableCell>
                          {app.package_ppo ? `₹${app.package_ppo} LPA` : "-"}
                        </TableCell>
                        <TableCell>₹{app.stipend_amount}</TableCell>
                        <TableCell>
                          {new Date(
                            app.internship_start_date
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(
                            app.internship_end_date
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {app.offer_letter_path ? (
                            offerLetterError ? (
                              <Alert severity="error">{offerLetterError}</Alert>
                            ) : (
                              <Button
                                onClick={() =>
                                  handleFileView(app.offer_letter_path)
                                }
                                sx={{
                                  textDecoration: "underline",
                                  color: "primary.main",
                                  fontSize: "12px",
                                }}
                              >
                                View
                              </Button>
                            )
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
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
                                  fontSize: "12px",
                                }}
                              >
                                View
                              </Button>
                            )
                          ) : (
                            "-"
                          )}
                        </TableCell>

                        <TableCell
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
                          {app.status || "Pending"}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => handleAction(app, "Approved")}
                              disabled={isButtonDisabled(app) || actionLoading}
                            >
                              {actionLoading ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <CircularProgress
                                    size={20}
                                    sx={{ color: "white" }}
                                  />
                                  <span>Processing...</span>
                                </Box>
                              ) : (
                                "Approve"
                              )}
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              onClick={() => handleAction(app, "Rejected")}
                              disabled={isButtonDisabled(app) || actionLoading}
                            >
                              {actionLoading ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <CircularProgress
                                    size={20}
                                    sx={{ color: "white" }}
                                  />
                                  <span>Processing...</span>
                                </Box>
                              ) : (
                                "Reject"
                              )}
                            </Button>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {app.noc_path ? (
                            <Button
                              onClick={() => handleFileView(app.noc_path)}
                              sx={{
                                textDecoration: "underline",
                                color: "primary.main",
                                fontSize: "12px",
                              }}
                            >
                              View NOC
                            </Button>
                          ) : app.status === "NOC Ready" ? (
                            "NOC Ready"
                          ) : (
                            app.status || "Pending"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
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
          >
            <DialogTitle
              sx={{
                backgroundColor: "#d05c24",
                color: "white",
                textAlign: "center",
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
                label="Remarks"
                multiline
                rows={4}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                required={action === "Rejected"}
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
                color={action === "Approved" ? "success" : "error"}
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
                disabled={confirmLoading}
                variant="outlined"
                sx={{
                  color: "#d05c24",
                  borderColor: "#d05c24",
                  "&:hover": {
                    borderColor: "#d05c24",
                    backgroundColor: "rgba(208, 92, 36, 0.04)",
                  },
                }}
              >
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      ) : (
        <HodAnalytics applications={applications} />
      )}
    </Box>
  );
}

export default HodPortal;
