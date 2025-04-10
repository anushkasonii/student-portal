import { useState, useEffect } from "react";
import { deleteHod, deleteFpc } from "../services/api";
import { MenuItem } from "@mui/material";
import { Eye, EyeOff } from "lucide-react";
import ProfileMenu from "./ProfileMenu";
import {
  IconButton,
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
  InputAdornment,
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
    console.log(`[AdminPortal][INFO] ${message}`, data ? data : "");
  },
  error: (message, error) => {
    console.error(`[AdminPortal][ERROR] ${message}`, error);
  },
  warn: (message, data) => {
    console.warn(`[AdminPortal][WARN] ${message}`, data ? data : "");
  },
};

function AdminPortal() {
  const [hods, setHods] = useState([]);
  const [fpcs, setFpcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAppPassword, setShowAppPassword] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
        Logger.warn("HODs data is not an array", {
          received: typeof fetchedHods,
        });
      }
      if (!Array.isArray(fetchedFpcs)) {
        Logger.warn("FPCs data is not an array", {
          received: typeof fetchedFpcs,
        });
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
    // Set the exact payload values as required
    // setFormData({
    //   name: "Hod MUJ",
    //   email: "hod.csemuj@gmail.com",
    //   password: "hodcseMUJ123",
    //   app_password: "itdkwyqxxlkzeexj",
    //   department: "CSE"
    // });
  };

  const handleCloseDialog = () => {
    Logger.info("Closing dialog");
    setOpenDialog(false);
    setDialogType("");
    setFormData({
      name: "",
      email: "",
      password: "",
      app_password: "",
      department: "",
    });
    setShowPassword(false);
    setShowAppPassword(false);
  };

  const handleDelete = async (type, id) => {
    if (actionLoading) return;
    setActionLoading(true);
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
      setActionLoading(false);
    }
  };

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = regex.test(email);
    Logger.info("Email validation", { email, isValid });
    return isValid;
  };

  const validateFormData = () => {
    if (!formData.name?.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.email?.trim()) {
      setError("Email is required");
      return false;
    }
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (!formData.app_password) {
      setError("App Password is required");
      return false;
    }
    if (!formData.department) {
      setError("Department is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    Logger.info("Processing form submission", { dialogType });
    try {
      if (!validateFormData()) {
        return;
      }

      setLoading(true);

      // Construct payload exactly as required
      const payload = {
        email: formData.email,
        name: formData.name,
        password: formData.password,
        department: formData.department,
        app_password: formData.app_password,
      };

      Logger.info("Submitting data", {
        type: dialogType,
        payload: {
          ...payload,
          password: "[REDACTED]",
          app_password: "[REDACTED]",
        },
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
      const errorMessage =
        err.response?.data?.error || "Failed to create entry";
      Logger.error("Submission failed", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
      setActionLoading(false);
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
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        position: "initial",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <ProfileMenu userRole="admin" />

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
                    Department
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
                    <TableCell>{hod.department}</TableCell>
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
                    Department
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
                    <TableCell>{fpc.department}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleDelete("fpc", fpc.id)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <CircularProgress
                              size={20}
                              sx={{ color: "white" }}
                            />
                            <span>Processing...</span>
                          </Box>
                        ) : (
                          "Delete"
                        )}
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
            {/* <TextField
              label="Password"
              type="password"
              fullWidth
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              sx={{ mb: 2 }}
            /> */}

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="large"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="App Password"
              // type="password"
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
