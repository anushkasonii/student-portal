import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
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
import { getApprovedSubmissions, submitHodReview } from '../services/api';

function HodPortal() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [action, setAction] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await getApprovedSubmissions();
      setApplications(data);
    } catch (error) {
      toast.error('Failed to fetch applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (app, actionType) => {
    setSelectedApp(app);
    setAction(actionType);
    setOpenDialog(true);
    setError('');
  };

  const handleSubmit = async () => {
    if (action === 'reject' && !remarks.trim()) {
      setError('Comments are required for rejection');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitHodReview({
        submissionId: selectedApp.id,
        status: action,
        remarks: remarks,
      });

      await fetchApplications();
      toast.success('Review submitted successfully');
      setOpenDialog(false);
      setRemarks('');
      setSelectedApp(null);
      setError('');
    } catch (error) {
      toast.error(error.message || 'Failed to submit review');
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, backgroundColor: '#f8f9fa' }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          color="primary"
          sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}
        >
          HOD Portal - Application Review
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#1e4c90' }}>
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
                  <TableCell>{app.registrationNumber}</TableCell>
                  <TableCell>{app.studentName}</TableCell>
                  <TableCell>{app.department}</TableCell>
                  <TableCell>{app.companyName}</TableCell>
                  <TableCell>{app.offerType}</TableCell>
                  <TableCell>₹{app.stipend}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleAction(app, 'accept')}
                        disabled={app.hodStatus !== ''}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleAction(app, 'reject')}
                        disabled={app.hodStatus !== ''}
                      >
                        Reject
                      </Button>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ 
                    backgroundColor: app.hodStatus === 'accept' ? '#e8f5e9' : 
                                   app.hodStatus === 'reject' ? '#ffebee' : 
                                   'transparent',
                    color: app.hodStatus === 'accept' ? '#2e7d32' :
                          app.hodStatus === 'reject' ? '#d32f2f' :
                          'inherit',
                    fontWeight: 'bold',
                    textTransform: 'capitalize'
                  }}>
                    {app.hodStatus || ''}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog 
        open={openDialog} 
        onClose={() => !isSubmitting && setOpenDialog(false)}
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
            label="Comments"
            multiline
            rows={4}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            required={action === 'reject'}
            error={Boolean(error)}
            helperText={error}
            sx={{ mt: 1 }}
            disabled={isSubmitting}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: '#f8f9fa', borderTop: '1px solid #ddd' }}>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color={action === 'accept' ? 'success' : 'error'}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
          <Button 
            onClick={() => setOpenDialog(false)} 
            variant="outlined"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default HodPortal;