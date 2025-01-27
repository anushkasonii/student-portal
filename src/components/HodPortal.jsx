import { useState, useEffect } from 'react';
import { getIdFromToken } from '../utils/authUtils';
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
} from '@mui/material';
import { getApprovedSubmissions, createHodReview } from '../services/api';

function HodPortal() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');

  useEffect(() => {
    fetchApprovedSubmissions();
  }, []);

  const fetchApprovedSubmissions = async () => {
    try {
      const data = await getApprovedSubmissions();
      if (Array.isArray(data)) {
        setApplications(data);
      } else {
        throw new Error('Invalid data format');
      }
      setError('');
    } catch (error) {
      setError('Failed to fetch submissions');
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (app, actionType) => {
    setSelectedApp(app);
    setAction(actionType);
    setOpenDialog(true);
    setError('');
  };

  const handleSubmit = async () => {
    if (action === 'Rejected' && !remarks.trim()) {
      setError('Comments are required for rejection');
      return;
    }

    const hodId = getIdFromToken('hod');

    if (!hodId) {
      setError('HOD ID not found');
      return;
    }

    try {
      const response = await createHodReview({
        submission_id: selectedApp.id,
        hod_id: hodId,
        action: action,
        remarks: remarks,
      });

      if (response.noc_path && action === 'Approved') {
        const nocUrl = response.noc_path;
        const a = document.createElement('a');
        a.href = nocUrl;
        a.download = `${selectedApp.registration_number}_noc.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

      await fetchApprovedSubmissions();
      setOpenDialog(false);
      setRemarks('');
      setSelectedApp(null);
      setError('');
    } catch (error) {
      setError('Failed to submit review');
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
      <Paper elevation={3} sx={{
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Reg. No.</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Student Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Department</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Company</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Offer Type</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Stipend</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>{app.registration_number}</TableCell>
                  <TableCell>{app.name}</TableCell>
                  <TableCell>{app.department}</TableCell>
                  <TableCell>{app.company_name}</TableCell>
                  <TableCell>{app.offer_type}</TableCell>
                  <TableCell>₹{app.stipend_amount}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleAction(app, 'Approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleAction(app, 'Rejected')}
                      >
                        Reject
                      </Button>
                    </Box>
                  </TableCell>
                  <TableCell>{app.status}</TableCell>
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
        <DialogTitle sx={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
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
            required={action === 'Rejected'}
            error={Boolean(error)}
            helperText={error}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: '#f8f9fa', borderTop: '1px solid #ddd' }}>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color={action === 'Approved' ? 'success' : 'error'}
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