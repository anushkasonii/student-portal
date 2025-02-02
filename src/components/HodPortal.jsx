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
  IconButton,
} from "@mui/material";
import { FileText } from "lucide-react";
import { getApprovedSubmissions, createHodReview } from "../services/api";

function HodPortal() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("");
  const [nocUrl, setNocUrl] = useState("");

  useEffect(() => {
    fetchApprovedSubmissions("Internship NOC"); 
    fetchApprovedSubmissions("Generic NOC");    
  }, []);
  
  

  const fetchApprovedSubmissions = async (nocType) => {  
    try {
        const response = await getApprovedSubmissions(nocType);  
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


  const handleAction = async (app, actionType) => {
    setSelectedApp(app);
    setAction(actionType);
    setOpenDialog(true);
    setError("");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "#e8f5e9"; // Light green background
      case "Rejected":
        return "#ffebee"; // Light red background
      default:
        return "inherit";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "Approved":
        return "#2e7d32"; // Dark green text
      case "Rejected":
        return "#c62828"; // Dark red text
      default:
        return "inherit";
    }
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
      const response = await createHodReview({
        submission_id: selectedApp.id,
        hod_id: hodId,
        action: action,
        remarks: remarks,
        noc_type: selectedApp.noc_type,  // Ensure NOC type is passed
      });
      

      // Store NOC URL if approved and NOC is generated
      if (response.noc_path && action === "Approved") {
        setNocUrl(response.noc_path);
      }

      await fetchApprovedSubmissions();
      setOpenDialog(false);
      setRemarks("");
      setSelectedApp(null);
      setError("");
    } catch (error) {
      setError("Failed to submit review");
    }
  };

  const handleViewNoc = (nocPath) => {
    window.open(nocPath, "_blank");
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
        mt: -45,
        backgroundColor: "#f8f9fa",
        padding: 2,
      }}
    >
      <Container
        maxWidth="lg"
        disableGutters
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
            margin: "0 auto",
            backgroundColor: "#fff",
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
            }}
          >
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
                    FPC Status
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Actions
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    NOC
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((app) => (
                  <TableRow
                    key={app.id}
                    sx={{
                      backgroundColor: getStatusColor(app.fpc_status),
                    }}
                  >
                    <TableCell>{app.registration_number}</TableCell>
                    <TableCell>{app.name}</TableCell>
                    <TableCell>{app.department}</TableCell>
                    <TableCell>{app.company_name}</TableCell>
                    <TableCell>{app.offer_type}</TableCell>
                    <TableCell>₹{app.stipend_amount}</TableCell>
                    <TableCell
                      sx={{ color: getStatusTextColor(app.fpc_status) }}
                    >
                      {app.fpc_status}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleAction(app, "Approved")}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleAction(app, "Rejected")}
                        >
                          Reject
                        </Button>
                      </Box>
                    </TableCell>
                    <TableCell>
  {app.noc_path ? (
    <a href={app.noc_path} target="_blank" rel="noopener noreferrer">
      View NOC
    </a>
  ) : (
    "-"
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
              variant="contained"
              color={action === "Approved" ? "success" : "error"}
            >
              Confirm {action}
            </Button>
            <Button onClick={() => setOpenDialog(false)} variant="outlined">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default HodPortal;
