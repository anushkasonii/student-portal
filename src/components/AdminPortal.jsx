import { useState, useEffect } from "react";
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

// Logger utility for consistent logging
const Logger = {
  info: (message, data) => {
    console.log(`[AdminPortal][INFO] ${message}`, data ? data : '');
  },
  error: (message, error) => {
    console.error(`[AdminPortal][ERROR] ${message}`, error);
  },
  warn: (message, data) => {
    console.warn(`[AdminPortal][WARN] ${message}`, data ? data : '');
  }
};

function AdminPortal() {
  const [hods, setHods] = useState([]);
  const [fpcs, setFpcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    app_password: "",
    department: "",
  });  

  useEffect(() => {
    Logger.info("Component mounted, initializing data fetch");
    fetchData();
    return () => {
      Logger.info("Component unmounting");
    };
  }, []);

  const fetchData = async () => {
    Logger.info("Starting data fetch operation");
    try {
      setLoading(true);
      
      Logger.info("Fetching HODs data");
      const fetchedHods = await getHods();
      Logger.info("HODs data received", { count: fetchedHods?.length });

      Logger.info("Fetching FPCs data");
      const fetchedFpcs = await getFpcs();
      Logger.info("FPCs data received", { count: fetchedFpcs?.length });

      if (!Array.isArray(fetchedHods)) {
        Logger.warn("HODs data is not an array", { received: typeof fetchedHods });
      }
      if (!Array.isArray(fetchedFpcs)) {
        Logger.warn("FPCs data is not an array", { received: typeof fetchedFpcs });
      }

      setHods(Array.isArray(fetchedHods) ? fetchedHods : []);
      setFpcs(Array.isArray(fetchedFpcs) ? fetchedFpcs : []);
      setError("");
      Logger.info("Data fetch completed successfully");
    } catch (err) {
      const errorMessage = "Failed to fetch data";
      Logger.error(errorMessage, err);
      setError(`${errorMessage}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type) => {
    Logger.info("Opening dialog", { type });
    setDialogType(type);
    setOpenDialog(true);
    setFormData({ name: "", email: "", password: "", app_password: "", department: "" });
  };

  const handleCloseDialog = () => {
    Logger.info("Closing dialog");
    setOpenDialog(false);
    setDialogType("");
    setFormData({ name: "", email: "", password: "", app_password: "", department: "" });
  };

  const handleDelete = async (type, id) => {
    Logger.info("Attempting deletion", { type, id });
    try {
      setLoading(true);
      if (type === "hod") {
        Logger.info("Deleting HOD", { id });
        await deleteHod(id);
      } else {
        Logger.info("Deleting FPC", { id });
        await deleteFpc(id);
      }
      Logger.info("Deletion successful, refreshing data");
      await fetchData();
    } catch (err) {
      const errorMessage = `Failed to delete ${type.toUpperCase()}`;
      Logger.error(errorMessage, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = regex.test(email);
    Logger.info("Email validation", { email, isValid });
    return isValid;
  };

  const handleSubmit = async () => {
    Logger.info("Processing form submission", { dialogType });
    try {
      // Validation checks
      if (!formData.name || !formData.email || !formData.password || !formData.app_password || !formData.department) {
        Logger.warn("Incomplete form data", { formData: { ...formData, password: '[REDACTED]', app_password: '[REDACTED]' } });
        setError("Please fill all fields");
        return;
      }
  
      if (!validateEmail(formData.email)) {
        Logger.warn("Invalid email format", { email: formData.email });
        setError("Please enter a valid email address");
        return;
      }
  
      setLoading(true);
      
      // Construct payload according to backend requirements
      const payload = {
        email: formData.email,
        name: formData.name,
        password: formData.password,
        department: formData.department,
        app_password: formData.app_password
      };
  
      Logger.info("Submitting data", { 
        type: dialogType, 
        payload: { ...payload, password: '[REDACTED]', app_password: '[REDACTED]' } 
      });
  
      if (dialogType === "hod") {
        await createHod(payload);
        Logger.info("HOD created successfully");
      } else if (dialogType === "fpc") {
        await createFpc(payload);
        Logger.info("FPC created successfully");
      }
  
      await fetchData();
      handleCloseDialog();
      setError("");
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to create entry";
      Logger.error("Submission failed", err);
      setError(errorMessage);
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
        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
          Actions
        </TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {hods.map((hod) => (
        <TableRow key={hod.id}>
          <TableCell>{hod.name}</TableCell>
          <TableCell>{hod.email}</TableCell>
          <TableCell>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => handleDelete("hod", hod.id)}
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
        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
          Actions
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
              onClick={() => handleDelete("fpc", fpc.id)}
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
    label="App Password"
    type="password"
    fullWidth
    value={formData.app_password}
    onChange={(e) =>
      setFormData({ ...formData, app_password: e.target.value })
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
