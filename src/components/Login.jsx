import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin, loginHod, loginFpc } from "../services/api";
import { CircularProgress, IconButton, InputAdornment } from "@mui/material";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import logo from "./muj_header.png";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Grid,
} from "@mui/material";

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    const credentials = {
      email: formData.email,
      password: formData.password,
    };

    const loginFunctions = [
      { fn: loginAdmin, role: "admin", path: "/admin" },
      { fn: loginHod, role: "hod", path: "/hod" },
      { fn: loginFpc, role: "fpc", path: "/fpc" },
    ];

    let loginSuccessful = false;

    for (const { fn, role, path } of loginFunctions) {
      try {
        const response = await fn(credentials);
        // If login succeeds, set the tokens and navigate
        localStorage.setItem("token", response.token);
        localStorage.setItem("userRole", role);
        localStorage.setItem("userId", response.id);
        localStorage.setItem("isAuthenticated", "true");
        loginSuccessful = true;
        navigate(path);
        break;
      } catch (err) {
        console.error(`Failed login for ${role}:`, err);
        continue;
      }
    }

    if (!loginSuccessful) {
      setError("Invalid credentials. Please try again.");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        background: "linear-gradient(45deg, #f5f7fa 0%, #ffffff 100%)",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "60%",
          height: "100%",
          background:
            "linear-gradient(135deg, rgba(208, 92, 36, 0.05) 0%, rgba(241, 125, 74, 0.05) 100%)",
          clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)",
        }}
      />

      <Container maxWidth="lg" sx={{ my: "auto" }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: { xs: 4, md: 0 } }}>
              <img
                src={logo}
                alt="Manipal University Jaipur"
                style={{
                  width: "320px",
                  marginBottom: "2rem",
                }}
              />
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: "#bf4e1f",
                  mb: 2,
                  fontSize: { xs: "1rem", md: "2.1rem" },
                }}
              >
                Welcome to the Login Portal!
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "#4a5568",
                  maxWidth: "500px",
                  lineHeight: 1.8,
                }}
              >
                Please log in to proceed
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 4, md: 6 },
                borderRadius: 3,
                backgroundColor: "#ffffff",
                boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
                border: "1px solid rgba(0,0,0,0.05)",
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background: "linear-gradient(90deg, #d05c24, #f17d4a)",
                },
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  color: "#2d3748",
                  textAlign: "center",
                  fontWeight: 600,
                }}
              >
                Sign in to your account
              </Typography>

              {error && (
                <Alert
                  severity="error"
                  icon={<AlertCircle size={24} />}
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    backgroundColor: "rgba(255, 82, 82, 0.1)",
                    color: "#ff5252",
                    border: "1px solid rgba(255, 82, 82, 0.2)",
                  }}
                >
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={20} color="#4a5568" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#f8f9fa",
                      borderRadius: 2,
                      "&:hover": {
                        backgroundColor: "#ffffff",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#ffffff",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                        "& fieldset": {
                          borderColor: "#d05c24",
                          borderWidth: "2px",
                        },
                      },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={20} color="#4a5568" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePassword}
                          edge="end"
                          onMouseDown={(e) => e.preventDefault()}
                          sx={{ color: "#4a5568" }}
                        >
                          {showPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 4,
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#f8f9fa",
                      borderRadius: 2,
                      "&:hover": {
                        backgroundColor: "#ffffff",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#ffffff",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                        "& fieldset": {
                          borderColor: "#d05c24",
                          borderWidth: "2px",
                        },
                      },
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    backgroundColor: "#d05c24",
                    borderRadius: 2,
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    textTransform: "none",
                    boxShadow: "0 8px 25px rgba(208, 92, 36, 0.15)",
                    "&:hover": {
                      backgroundColor: "#bf4e1f",
                      boxShadow: "0 8px 25px rgba(208, 92, 36, 0.25)",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: "#ffffff" }} />
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Login;
