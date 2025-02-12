import { useState, useEffect } from "react";
import { getSubmissions } from "../services/api";
import { getAdmins } from "../services/api";
import { deleteHod, deleteFpc } from "../services/api";
import { MenuItem } from "@mui/material";


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
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { getHods, getFpcs, createHod, createFpc } from "../services/api";

function AdminPortal() {
  const [hods, setHods] = useState([]);
  const [applications, setApplications] = useState([]);
  const [fpcs, setFpcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(""); // "hod" or "fpc"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const submissions = await getSubmissions();
        setApplications(submissions);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fetchedHods, fetchedFpcs, fetchedAdmins] = await Promise.all([
        getHods(),
        getFpcs(),
        getAdmins(),
      ]);

      setHods(Array.isArray(fetchedHods) ? fetchedHods : []);
      setFpcs(Array.isArray(fetchedFpcs) ? fetchedFpcs : []);
      setAdmins(Array.isArray(fetchedAdmins) ? fetchedAdmins : []);
      setError("");
    } catch (err) {
      setError("Failed to fetch data: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type) => {
    setDialogType(type);
    setOpenDialog(true);
    setFormData({ name: "", email: "" });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogType("");
    setFormData({ name: "", email: "" });
  };

  const handleDelete = async (type, id) => {
    try {
      setLoading(true);
      if (type === "hod") {
        await deleteHod(id);
      } else {
        await deleteFpc(id);
      }
      await fetchData();
    } catch (err) {
      setError(`Failed to delete ${type.toUpperCase()}`);
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const handleSubmit = async () => {
    try {
      if (
        !formData.name ||
        !formData.email ||
        !formData.password ||
        !formData.department
      ) {
        setError("Please fill all fields");
        return;
      }
      if (!validateEmail(formData.email)) {
        setError("Please enter a valid email address");
        return;
      }

      setLoading(true);

      const payload = {
        name: formData.name,
        email: formData.email,
        app_password: formData.password,
        department: formData.department,
      };

      if (dialogType === "hod") {
        await createHod({ ...payload, password: formData.password });
      } else if (dialogType === "fpc") {
        await createFpc({ ...payload, password: formData.password });
      }

      await fetchData(); // Refresh data after successful creation
      handleCloseDialog();
      setError(""); // Clear any existing errors
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create entry");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        padding: 2,
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            ml: 10,
            borderRadius: 2,
            backgroundColor: "#fff",
            width: "80%",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 4,
              fontWeight: "bold",
              color: "#d05c24",
              textAlign: "center",
            }}
          >
            Admin Portal
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* HODs Table */}
          <Typography variant="h5" sx={{ mb: 2, color: "#d05c24" }}>
            List of HODs
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#D97C4F" }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Email
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hods.map((hod) => (
                  <TableRow key={hod.id}>
                    <TableCell>{hod.name}</TableCell>
                    <TableCell>{hod.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Button
            variant="contained"
            sx={{
              mb: 4,
              backgroundColor: "#d05c24",
              color: "white",
              "&:hover": { backgroundColor: "#bf4e1f" },
            }}
            onClick={() => handleOpenDialog("hod")}
          >
            Add HOD
          </Button>

          {/* FPCs Table */}
          <Typography variant="h5" sx={{ mb: 2, color: "#d05c24" }}>
            List of FPCs
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: "#D97C4F" }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Email
                  </TableCell>

                </TableRow>
              </TableHead>
              <TableBody>
                {fpcs.map((fpc) => (
                  <TableRow key={fpc.id}>
                    <TableCell>{fpc.name}</TableCell>
                    <TableCell>{fpc.email}</TableCell>
                    <TableCell>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleDelete("hod", fpc.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Button
            variant="contained"
            sx={{
              mt: 4,
              backgroundColor: "#d05c24",
              color: "white",
              "&:hover": { backgroundColor: "#bf4e1f" },
            }}
            onClick={() => handleOpenDialog("fpc")}
          >
            Add FPC
          </Button>
        </Paper>

        {/* Dialog for Adding HOD/FPC */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle
            sx={{
              backgroundColor: "#d05c24",
              color: "white",
              textAlign: "center",
            }}
          >
            ADD {dialogType === "hod" ? "HOD" : "FPC"}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              sx={{ mb: 2, mt: 3 }}
            />
            <TextField
              label="Email"
              fullWidth
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              select
              label="Department"
              fullWidth
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              sx={{ mb: 2 }}
            >
              <MenuItem value="CSE">CSE</MenuItem>
              <MenuItem value="IT">IT</MenuItem>
              {/* Add other departments as needed */}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{ backgroundColor: "#d05c24", color: "white" }}
            >
              Submit
            </Button>
            <Button onClick={handleCloseDialog} variant="outlined">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default AdminPortal;
