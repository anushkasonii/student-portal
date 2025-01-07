import { useState } from 'react';
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
} from '@mui/material';

const mockSubmissions = [
  {
    id: 1,
    studentName: 'John Doe',
    registrationNumber: '2021001',
    department: 'CSE',
    companyName: 'Tech Corp',
    reviewerStatus: 'Accepted',
    hodStatus: 'Pending',
  },
];

export default function HodPortal() {
  const [open, setOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [remarks, setRemarks] = useState('');

  const handleReview = (submission) => {
    setSelectedSubmission(submission);
    setOpen(true);
  };

  const handleAction = (action) => {
    console.log(action, selectedSubmission, remarks);
    setOpen(false);
    setRemarks('');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Component content remains the same */}
    </Container>
  );
}