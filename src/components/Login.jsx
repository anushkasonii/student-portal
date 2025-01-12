import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e, role) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    // Temporary login logic (replace with actual API integration)
    if (formData.username === 'reviewer' && formData.password === 'password' && role === 'reviewer') {
      localStorage.setItem('userRole', 'reviewer');
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/reviewer');
    } else if (formData.username === 'hod' && formData.password === 'password' && role === 'hod') {
      localStorage.setItem('userRole', 'hod');
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/hod');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  return (
    <>
      <div className="app-header">
        <Container>
          <Typography variant="h4" align="center" sx={{color:'black'}}>
            Staff Login Portal
          </Typography>
        </Container>
      </div>
      <Container maxWidth="sm">
        <Paper className="login-container">
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Username/Email"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                variant="outlined"
                sx={{ backgroundColor: 'white' }}
              />
            </Box>
            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                variant="outlined"
                sx={{ backgroundColor: 'white' }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                onClick={(e) => handleSubmit(e, 'hod')}
                sx={{ 
                  py: 1.5,
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#1565c0'
                  }
                }}
              >
                Login as HOD
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                size="large"
                onClick={(e) => handleSubmit(e, 'reviewer')}
                sx={{ 
                  py: 1.5,
                  backgroundColor: '#2e7d32',
                  '&:hover': {
                    backgroundColor: '#1b5e20'
                  }
                }}
              >
                Login as Reviewer
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </>
  );
}

export default Login;