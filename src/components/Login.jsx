import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginReviewer, loginHod } from '../services/api';

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
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e, role) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);


    // const trimmedEmail = formData.email.trim();
    // const trimmedPassword = formData.password.trim();

    // try {
    //   console.log('Sending data:', { email: trimmedEmail, password: trimmedPassword });

    //   const response = await fetch(`http://localhost:8080/${role}/login`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       email: trimmedEmail,
    //       password: trimmedPassword,
    //     }),
    //   });

      try {
        const loginFn = role === 'reviewer' ? loginReviewer : loginHod;
        const response = await loginFn({
          email: formData.email,
          password: formData.password
        });
  
        localStorage.setItem('token', response.token);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userId', response.id);
        localStorage.setItem('isAuthenticated', 'true');
        
        navigate(role === 'reviewer' ? '/reviewer' : '/hod');
      } catch (error) {
        setError(error.response?.data?.error || 'Invalid credentials');
      } finally {
        setLoading(false);
      }
    };
    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
      setError('');
    };
  
  

  //     if (response.ok) {
  //       const data = await response.json();
  //       localStorage.setItem('token', data.token);

  //       if (role === 'reviewer') {
  //         navigate('/reviewer/submissions');
  //       } else if (role === 'hod') {
  //         navigate('/hod/submissions/approved');
  //       }
  //     } else {
  //       const errorData = await response.json();
  //       setError(errorData.error || 'Invalid credentials');
  //     }
  //   } catch (err) {
  //     console.error('Error logging in:', err);
  //     setError('Something went wrong. Please try again.');
  //   }
  // };

  

  return (
    <>
      <div className="app-header">
        <Container>
          <Typography variant="h4" align="center" sx={{ color: 'black' }}>
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
                label="Email"
                name="email"
                value={formData.email}
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
              {['hod', 'reviewer'].map((role) => (
                <Button
                  key={role}
                  fullWidth
                  variant="contained"
                  color={role === 'hod' ? 'primary' : 'secondary'}
                  size="large"
                  onClick={(e) => handleSubmit(e, role)}
                  sx={{
                    py: 1.5,
                    backgroundColor: role === 'hod' ? '#1976d2' : '#2e7d32',
                    '&:hover': {
                      backgroundColor: role === 'hod' ? '#1565c0' : '#1b5e20',
                    },
                  }}
                >
                  Login as {role.toUpperCase()}
                </Button>
              ))}
            </Box>
          </form>
        </Paper>
      </Container>
    </>
  );
}

export default Login;