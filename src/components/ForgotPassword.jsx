import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Key, Lock } from 'lucide-react';
import { sendOtpToEmail, verifyEmailOtp, updateFpc, updateHod, getFpcs, getHods } from '../services/api';
import logo from './muj_header.png';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const navigate = useNavigate();

  const steps = ['Enter Email', 'Verify OTP', 'Reset Password'];

  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) return 'Password must be at least 8 characters';
    if (!hasUpperCase) return 'Password must contain an uppercase letter';
    if (!hasLowerCase) return 'Password must contain a lowercase letter';
    if (!hasNumbers) return 'Password must contain a number';
    if (!hasSpecialChar) return 'Password must contain a special character';
    return '';
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await sendOtpToEmail(email);
      setStep(1);
      setOtpTimer(300); // 5 minutes
      setSuccess('OTP sent to your email');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await verifyEmailOtp({ email, otp });
      setStep(2);
      setSuccess('OTP verified successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      let userId = null;

      // Fetch the user's data from the backend
      const fpcResponse = await getFpcs();
      const fpc = fpcResponse.find((user) => user.email === email);

      if (fpc) {
        userId = fpc.id;
        await updateFpc({ id: userId, password: newPassword });
      } else {
        const hodResponse = await getHods();
        const hod = hodResponse.find((user) => user.email === email);

        if (hod) {
          userId = hod.id;
          await updateHod({ id: userId, password: newPassword });
        } else {
          throw new Error('User not found with the provided email');
        }
      }

      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        background: 'linear-gradient(45deg, #f5f7fa 0%, #ffffff 100%)',
      }}
    >
      <Container maxWidth="sm" sx={{ my: 'auto' }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <img
            src={logo}
            alt="Manipal University Jaipur"
            style={{ width: '250px', marginBottom: '1rem' }}
          />
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: '#ffffff',
            boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #d05c24, #f17d4a)',
            },
          }}
        >
          <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {step === 0 && (
            <Box component="form" onSubmit={handleSendOtp}>
              <TextField
                fullWidth
                label="Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.5,
                  backgroundColor: '#d05c24',
                  '&:hover': { backgroundColor: '#bf4e1f' },
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Send OTP'}
              </Button>
            </Box>
          )}

          {step === 1 && (
            <Box component="form" onSubmit={handleVerifyOtp}>
              <TextField
                fullWidth
                label="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Key size={20} />
                    </InputAdornment>
                  ),
                }}
              />
              {otpTimer > 0 && (
                <Typography variant="caption" color="textSecondary">
                  OTP expires in: {Math.floor(otpTimer / 60)}:
                  {(otpTimer % 60).toString().padStart(2, '0')}
                </Typography>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || !otp}
                sx={{
                  mt: 3,
                  py: 1.5,
                  backgroundColor: '#d05c24',
                  '&:hover': { backgroundColor: '#bf4e1f' },
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
              </Button>
            </Box>
          )}

          {step === 2 && (
            <Box component="form" onSubmit={handleResetPassword}>
              <TextField
                fullWidth
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.5,
                  backgroundColor: '#d05c24',
                  '&:hover': { backgroundColor: '#bf4e1f' },
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Reset Password'}
              </Button>
            </Box>
          )}

          <Button
            onClick={() => navigate('/login')}
            sx={{
              mt: 2,
              color: '#d05c24',
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'underline',
              },
            }}
          >
            Back to Login
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

export default ForgotPassword;