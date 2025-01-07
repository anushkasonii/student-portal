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
    status: 'Pending',
  },
];

export default function ReviewerPortal() {
  const [open, setOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [comments, setComments] = useState('');

  const handleReview = (submission) => {
    setSelectedSubmission(submission);
    setOpen(true);
  };

  const handleAction = (action) => {
    console.log(action, selectedSubmission, comments);
    setOpen(false);
    setComments('');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Component content remains the same */}
    </Container>
  );
}