import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin, loginHod, loginSpc } from "../services/api"; 
import { CircularProgress } from "@mui/material";
import logo from "./muj_header.png";

import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from "@mui/material";

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

    // List of login functions to try
    const loginFunctions = [
      { fn: loginAdmin, role: "admin", path: "/admin" },
      { fn: loginHod, role: "hod", path: "/hod" },
      { fn: loginSpc, role: "spc", path: "/spc" },
    ];

    for (const { fn, role, path } of loginFunctions) {
      try {
        const response = await fn({
          email: formData.email,
          password: formData.password,
        });

        // Store authentication details
        localStorage.setItem("token", response.token);
        localStorage.setItem("userRole", role);
        localStorage.setItem("userId", response.id);
        localStorage.setItem("isAuthenticated", "true");

        // Navigate to the correct dashboard
        navigate(path);
        return;
      } catch (err) {
        // Log error, but do not show it yet
        console.error(`Failed login for ${role}:`, err);
      }
    }

    // If all logins fail, show error
    setError("Invalid credentials. Please try again.");
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        minWidth: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f9f9f9",
        color: "#1e4c90",
        padding: 2,
      }}
    >
      <>
        {/* Logo at the top */}
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt:-20
             // Add margin to push content below
          }}
        >
          <img
            src={logo}
            alt="Manipal University Jaipur"
            style={{
              maxWidth: "500px", // Increased size
              height: "auto",
            }}
          />
        </Box>
  
        {/* Title and Instructions */}
        <Container>
          <Typography
            variant="h4"
            align="center"
            sx={{
              mb: 8,
              mt: -3,
              fontWeight: "bold",
              color: "#334e90",
            }}
          >
            Welcome to the Login Portal
          </Typography>
         
        </Container>
  
        {/* Login Form */}
        <Container maxWidth="sm">
          <Paper
            sx={{
              p: 4,
              borderRadius: 1.5,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              backgroundColor: "#ffffff",
              border: "1px solid #e0e0e0",
            }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  sx={{ backgroundColor: "#fdfdfd" }}
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
                  sx={{ backgroundColor: "#fdfdfd" }}
                />
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Button
                  type="submit"
                  variant="contained"
                
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    px: 7,
                    fontWeight: "bold",
                    color:'white',
                    backgroundColor:'#d05c24',
                    borderRadius: 2,
                    textTransform: "none",
                    boxShadow: "0 4px 8px rgba(255, 165, 0, 0.3)",
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "LOGIN"}
                </Button>
              </Box>
            </form>
          </Paper>
        </Container>
      </>
    </Box>
  );  
}

export default Login;