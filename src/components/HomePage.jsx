import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Card, CardContent, Grid, AppBar, Toolbar } from "@mui/material";
import { AccountCircle, School } from "@mui/icons-material";
import logo from "./muj_header.png";

function HomePage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #1e4c90, #d05c24)",
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        overflowX: "hidden", // Ensures no horizontal scroll
      }}
    >
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(8px)", width: "100vw" }}>
        <Toolbar sx={{ justifyContent: "center" }}>
          <img src={logo} alt="Manipal University Jaipur" style={{ height: "100px" }} />
        </Toolbar>
      </AppBar>

      {/* Main Content - Full Width */}
      <Box sx={{ flexGrow: 1, textAlign: "center", mt: 8, width: "100vw", px: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="white">
          NOC Application Portal
        </Typography>
        <Typography variant="h6" color="white" sx={{ mt: 2, opacity: 0.9 }}>
          Welcome to the NOC Application Portal. Choose your role to proceed.
        </Typography>

        {/* Role Selection Cards */}
        <Grid container spacing={4} justifyContent="space-evenly" sx={{ mt: 6, width: "100%" }}>
          {/* Student Portal */}
          <Grid item xs={12} sm={5} display="flex" justifyContent="center">
            <Card
              onClick={() => navigate("/student-form")}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "white",
                cursor: "pointer",
                transition: "transform 0.2s ease",
                "&:hover": { transform: "scale(1.05)", backgroundColor: "rgba(255, 255, 255, 0.2)" },
                backdropFilter: "blur(8px)",
                width: "100%", // Ensure cards expand properly
                maxWidth: 400,
              }}
            >
              <CardContent>
                <AccountCircle sx={{ fontSize: 60, color: "white" }} />
                <Typography variant="h5" fontWeight="bold" mt={2}>
                  Student Portal
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8 }}>
                  Apply for NOC for your internship or job offer.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Faculty Portal */}
          <Grid item xs={12} sm={5} display="flex" justifyContent="center">
            <Card
              onClick={() => navigate("/login")}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "white",
                cursor: "pointer",
                transition: "transform 0.2s ease",
                "&:hover": { transform: "scale(1.05)", backgroundColor: "rgba(255, 255, 255, 0.2)" },
                backdropFilter: "blur(8px)",
                width: "100%", // Ensure cards expand properly
                maxWidth: 400,
              }}
            >
              <CardContent>
                <School sx={{ fontSize: 60, color: "white" }} />
                <Typography variant="h5" fontWeight="bold" mt={2}>
                  Faculty Portal
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8 }}>
                  
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 2, textAlign: "center", color: "white", backgroundColor: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(8px)", width: "100vw" }}>
        <Typography variant="body2">© {new Date().getFullYear()} Manipal University Jaipur. All rights reserved.</Typography>
      </Box>
    </Box>
  );
}

export default HomePage;
