import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/login', {
        username,
        password,
        role,
      });

      const { token, userRole } = response.data;

      // Save token and role to localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('role', userRole);

      // Navigate to the correct portal based on role
      if (userRole === 'reviewer') {
        navigate('/reviewer');
      } else if (userRole === 'hod') {
        navigate('/hod');
      }
    } catch (err) {
      setError('Invalid credentials or role');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box mb={2}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Box>
          <Box mb={2}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Box>
          <Box mb={2}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <MenuItem value="reviewer">Reviewer</MenuItem>
                <MenuItem value="hod">HoD</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {error && (
            <Typography color="error" mb={2}>
              {error}
            </Typography>
          )}
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Login
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

