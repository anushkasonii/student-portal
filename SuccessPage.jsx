import React from "react";
import { Box, Typography, Container, Paper } from "@mui/material";

const SuccessPage = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        minWidth: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        color: "#1e4c90",
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: "center" }}>
          <Typography variant="h4" gutterBottom sx={{ color: "#d05c24" }}>
            Form Submitted Successfully
          </Typography>
          <Typography variant="body1" sx={{ color: "#1e4c90" }}>
            Thank you for submitting the form. We have received your application and will process it shortly.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default SuccessPage;