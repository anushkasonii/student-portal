import { useState, useEffect } from "react";
import { getIdFromToken, getEmailFromToken } from "../utils/authUtils";
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
import { getApprovedSubmissions, createHodReview, getFileUrl } from "../services/api";

function HodPortal() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("");
  const [hodEmail, setHodEmail] = useState("");

  useEffect(() => {
    fetchApprovedSubmissions();
    const email = getEmailFromToken();
    if (email) {
      setHodEmail(email);
    }
  }, []);

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
  
      window.open(blobUrl, "_blank");
    } catch (error) {
      console.error("Error viewing file:", error);
      alert("Unable to open file. Please try again.");
    }
  };
  
  const isButtonDisabled = (app) => {
    // If HOD email is shushilavishnoi@gmail.com, only disable buttons when status is "NOC ready"
    if (hodEmail === "shusheelavishnoi@gmail.com") {
      return app.status === "NOC ready";
    }
    // For other HODs, maintain original logic
    return !app.status || app.status === "Pending" || app.status === "Rejected" || app.status === "NOC ready";
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

    try {
      await createHodReview({
        submission_id: selectedApp.id,
        hod_id: hodId,
        status: action,
        comments: remarks.trim()
      });

      setApplications(prevApps => 
        prevApps.map(app => 
          app.id === selectedApp.id 
            ? { ...app, status: action }
            : app
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
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", width: "94vw", overflowX: "hidden", p: 3, backgroundColor: "#f8f9fa" }}>
      <Container maxWidth={false} sx={{ width: "95%" }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, width: "95%" }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: "bold", textAlign: "center", color: "#d05c24" }}>
            HOD Portal - Application Review
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
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Reg. No.</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Student Name</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Department</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Company</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Offer Type</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Internship Type</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>PPO Package</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Stipend</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Start Date</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>End Date</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>FPC Status</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>NOC Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((app) => (
                  <TableRow 
                    key={app.id}
                    sx={{ 
                      backgroundColor: app.status === "Approved" ? "#BDE7BD" :
                                     app.status === "Rejected" ? "#FF8E85" :
                                     app.status === "NOC ready" ? "#F7D2C4" :
                                     "inherit"
                    }}
                  >
                    <TableCell>{app.registration_number}</TableCell>
                    <TableCell>{app.name}</TableCell>
                    <TableCell>{app.department}</TableCell>
                    <TableCell>{app.company_name}</TableCell>
                    <TableCell>{app.offer_type}</TableCell>
                    <TableCell>{app.offer_type_detail}</TableCell>
                    <TableCell>{app.package_ppo ? `₹${app.package_ppo} LPA` : '-'}</TableCell>
                    <TableCell>₹{app.stipend_amount}</TableCell>
                    <TableCell>{new Date(app.internship_start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(app.internship_end_date).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ 
                      backgroundColor: app.status === "Approved" ? "#BDE7BD" : 
                                    app.status === "Rejected" ? "#FF8E85" : 
                                    app.status === "NOC ready" ? "#F7D2C4" :
                                    "inherit"
                    }}>
                      {app.status || "Pending"}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleAction(app, "Approved")}
                          disabled={isButtonDisabled(app)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleAction(app, "Rejected")}
                          disabled={isButtonDisabled(app)}
                        >
                          Reject
                        </Button>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {app.noc_path ? (
                         <Button
                         onClick={() => handleFileView(app.noc_path)}
                         sx={{ textDecoration: 'underline', color: 'primary.main' }}
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
        </Paper>

        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle sx={{ backgroundColor: "#d05c24", color: "white", textAlign: "center" }}>
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
          <DialogActions sx={{ p: 2, backgroundColor: "#f8f9fa", borderTop: "1px solid #ddd" }}>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color={action === "Approved" ? "success" : "error"}
            >
              Confirm {action}
            </Button>
            <Button 
              onClick={() => setOpenDialog(false)} 
              variant="outlined"
              sx={{
                color: "#d05c24",
                borderColor: "#d05c24",
                '&:hover': {
                  borderColor: "#d05c24",
                  backgroundColor: "rgba(208, 92, 36, 0.04)"
                }
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

export default HodPortal;