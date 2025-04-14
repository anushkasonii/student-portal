import { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  FormControlLabel,
  Checkbox,
  Grid,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  submitApplication,
  sendOtpToEmail,
  verifyEmailOtp,
} from "../services/api";
import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip";
import { useNavigate } from "react-router-dom";

const validationSchema = yup
  .object({
    registrationNumber: yup
      .string()
      .required("Registration Number is required"),
    name: yup.string().required("Name is required"),
    email: yup
      .string()
      .matches(
        /^[a-zA-Z]+\.[a-zA-Z0-9]+@muj\.manipal\.edu$/,
        "Enter your official mail id"
      )
      .required("Email is required"),
    mobile: yup
      .string()
      .matches(/^[0-9]{10}$/, "Mobile Number must be 10 digits")
      .required("Mobile Number is required"),
    department: yup.string().required("Department is required"),
    semester: yup.number().required("Semester is required"),
    nocType: yup.string().required("NOC Type is required"),
    gender: yup.string().required("Gender is required"),
    section: yup.string().required("Section is required"),
    cgpa: yup.string().when("nocType", {
      is: "Specific",
      then: () =>
        yup
          .string()
          .required("CGPA is required for 'Specific' NOC type")
          .matches(
            /^[0-9](\.[0-9]{1,2})?$|^10(\.0{1,2})?$/,
            "Enter valid CGPA between 0-10"
          ),
    }),
    backlogs: yup.string().when("nocType", {
      is: "Specific",
      then: () =>
        yup
          .string()
          .required("Backlogs information is required for 'Specific' NOC type")
          .matches(/^[0-9]+$/, "Enter valid number of backlogs"),
    }),
    offerType: yup.string().required("Offer Type is required"),
    companyName: yup.string().when("nocType", {
      is: "Specific",
      then: () =>
        yup
          .string()
          .required("Company name is required")
          .matches(
            /^[A-Z][a-zA-Z\s]*$/,
            "The first letter of the company name should be capital"
          ),
      otherwise: () => yup.string(),
    }),

    companyCity: yup.string().when("nocType", {
      is: "Specific",
      then: () => yup.string().required("City is required"),
      otherwise: () => yup.string(),
    }),
    companyState: yup.string().when("nocType", {
      is: "Specific",
      then: () => yup.string().required("State is required"),
      otherwise: () => yup.string(),
    }),
    companyPin: yup.string().when("nocType", {
      is: "Specific",
      then: () =>
        yup
          .string()
          .matches(/^[0-9]{6}$/, "PIN code must be 6 digits")
          .required("PIN code is required"),
      otherwise: () => yup.string(),
    }),
    internshipType: yup.string().required("Internship type is required"),
    hrdEmail: yup.string().email("Enter a valid email"),
    hrdNumber: yup
      .string()
      .matches(/^[0-9]{10}$/, "Enter a valid 10-digit number"),
    hasOfferLetter: yup.boolean(),
    ppoPackage: yup.number().when("internshipType", {
      is: "Internship with PPO",
      then: () =>
        yup
          .number()
          .required("PPO package is required")
          .positive("Package must be positive")
          .typeError("Please enter a valid number"),
    }),
    stipend: yup
      .number()
      .required("Stipend amount is required")
      .min(0, "Stipend cannot be negative")
      .typeError("Please enter a valid number"),

    startDate: yup.date().required("Start date is required"),
    endDate: yup.date().required("End date is required"),
    termsAccepted: yup
      .boolean()
      .oneOf([true], "You must accept the terms and conditions"),
  })
  .test(
    "hrdContact",
    "Either HRD Email or HRD Number is required",
    function (value) {
      if (!value.hrdEmail && !value.hrdNumber) {
        return this.createError({
          path: "hrdEmail",
          message: "Either HRD Email or HRD Number is required",
        });
      }
      return true;
    }
  );
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z]+\.[a-zA-Z0-9]+@muj\.manipal\.edu$/;
  return emailRegex.test(email);
};
function StudentForm() {
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState([]);
  const [offerLetter, setOfferLetter] = useState(null);
  const [mailCopy, setMailCopy] = useState(null);
  const [fileError, setFileError] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateFile = (file, isRequired = false) => {
    if (isRequired && !file) return "File is required";
    if (file) {
      if (!file.type.includes("pdf")) return "File must be a PDF";
      if (file.size > 5 * 1024 * 1024) return "File size must be less than 5MB";
      if (file.name.includes(" ")) return "File name should not contain spaces";
    }
    return "";
  };

  const NOC_TYPE_INFO = {
    Specific:
      "For company-specific internships. Requires both mail copy and offer letter from the company.",
    Generic:
      "For summer internships only. Used when either no offer letter is available or a general NOC is needed.",
  };

  const formik = useFormik({
    initialValues: {
      registrationNumber: "",
      name: "",
      email: "",
      mobile: "",
      department: "",
      section: "",
      offerType: "",
      semester: "",
      cgpa: "",
      backlogs: "",
      gender: "",
      companyName: "",
      companyCity: "",
      companyState: "",
      nocType: "",
      companyPin: "",
      internshipType: "",
      ppoPackage: "",
      stipend: "",
      startDate: "",
      endDate: "",
      hrdEmail: "",
      hrdNumber: "",
      termsAccepted: false,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      if (isSubmitting) return; // Prevent multiple submissions
      if (!emailVerified) {
        setSubmissionStatus("Please verify your email first.");
        return;
      }

      try {
        setIsSubmitting(true); // Set loading state
        setFileError("");
        setSubmissionStatus("Processing your application...");

        // Validate files based on NOC type
        const mailCopyError = validateFile(mailCopy, true);
        const offerLetterError =
          values.nocType === "Specific"
            ? validateFile(offerLetter, true)
            : validateFile(offerLetter);

        if (
          mailCopyError ||
          (values.nocType === "Specific" && offerLetterError)
        ) {
          setFileError(mailCopyError || offerLetterError);
          return;
        }

        // Validate dates
        const startDate = new Date(values.startDate);
        const endDate = new Date(values.endDate);
        if (endDate <= startDate) {
          setSubmissionStatus("End date must be after start date");
          return;
        }

        // Create FormData
        const formData = new FormData();

        // Add basic fields
        Object.entries(values).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            formData.append(key, value);
          }
        });

        // Add files
        if (mailCopy) {
          formData.append("mailCopy", mailCopy);
        }

        if (values.nocType === "Specific" && offerLetter) {
          formData.append("offerLetter", offerLetter);
        }

        // Add numeric fields with proper formatting
        formData.append("stipend_amount", values.stipend);
        if (
          values.internshipType === "Internship with PPO" &&
          values.ppoPackage
        ) {
          formData.append("package_ppo", values.ppoPackage);
        }

        // Submit form
        const response = await submitApplication(formData);

        // Handle success
        formik.resetForm();
        setOfferLetter(null);
        setMailCopy(null);
        setFormErrors([]);
        setSubmissionStatus("Application submitted successfully!");
        navigate("/success");
      } catch (error) {
        console.error("Submission error:", error);
        setSubmissionStatus(
          error.response?.data?.message || "Failed to submit application"
        );
      } finally {
        setIsSubmitting(false); // Reset loading state
      }
    },
  });

  // File handlers
  const handleOfferLetterChange = (event) => {
    try {
      const file = event.target.files[0];
      const error = validateFile(file, formik.values.nocType === "Specific");
      if (error) {
        setFileError(error);
        return;
      }
      setOfferLetter(file);
      setFileError("");
    } catch (error) {
      setFileError("Error processing file. Please try again.");
    }
  };

  const handleMailCopyChange = (event) => {
    const file = event.target.files[0];
    const error = validateFile(file, true);
    if (error) {
      setFileError(error);
      return;
    }
    setMailCopy(file);
    setFileError("");
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    formik.handleChange(e);
    setIsEmailValid(validateEmail(email));
    setEmailVerified(false);
    setOtpSent(false);
  };

  const handleSendOtp = async () => {
    try {
      setSubmissionStatus("Sending OTP...");
      await sendOtpToEmail(formik.values.email);
      setOtpSent(true);
      setSubmissionStatus("OTP sent to your email.");
    } catch (error) {
      setSubmissionStatus("Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setSubmissionStatus("Verifying OTP...");
      const data = {
        email: formik.values.email,
        otp: otp,
      };
      await verifyEmailOtp(data);

      setEmailVerified(true);
      setSubmissionStatus("Email verified successfully!");
    } catch (error) {
      console.error("Verification error:", error);
      setSubmissionStatus("Invalid OTP. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh", // Full viewport height
        minWidth: "100vw",
        display: "block",
        alignItems: "center", // Vertical alignment
        justifyContent: "center", // Horizontal alignment
        backgroundColor: "#f5f5f5", // Light gray background
        color: "#1e4c90", // Primary text color
      }}
    >
      <Box
        className="app-header"
        sx={{
          py: 3,
          backgroundColor: "#d05c24",
          color: "white",
          textAlign: "center",
          mb: 1,
        }}
      >
        <Typography variant="h4" sx={{ mb: 3 }}>
          Internship NOC Application Portal
        </Typography>
      </Box>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography
            variant="h5"
            gutterBottom
            align="center"
            color="#d05c24"
            sx={{ mb: 3, fontSize: "26px" }}
          >
            Fill in the Details
          </Typography>
          {fileError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {fileError}
            </Alert>
          )}
          {submissionStatus && (
            <Alert
              severity={
                submissionStatus.includes("successfully") ? "success" : "error"
              }
              sx={{ mb: 2 }}
            >
              {submissionStatus}
            </Alert>
          )}
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur} // ✅ Ensures validation runs
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              {/* Registration Number */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="registrationNumber"
                  name="registrationNumber"
                  label="Registration Number"
                  value={formik.values.registrationNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur} // ✅ Ensures validation runs
                  error={
                    formik.touched.registrationNumber &&
                    Boolean(formik.errors.registrationNumber)
                  }
                  helperText={
                    formik.touched.registrationNumber &&
                    formik.errors.registrationNumber
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Official Email ID"
                  type="email"
                  value={formik.values.email}
                  onChange={handleEmailChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  disabled={emailVerified}
                />
                {isEmailValid && !emailVerified && (
                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={handleSendOtp}
                      disabled={otpSent}
                      sx={{ backgroundColor: "#d05c24" }}
                    >
                      {otpSent ? "OTP Sent" : "Send OTP"}
                    </Button>
                    {otpSent && (
                      <>
                        <TextField
                          size="small"
                          placeholder="Enter OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          sx={{ width: "150px" }}
                        />
                        <Button
                          variant="contained"
                          onClick={handleVerifyOtp}
                          sx={{ backgroundColor: "#d05c24" }}
                        >
                          Verify OTP
                        </Button>
                      </>
                    )}
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="mobile"
                  name="mobile"
                  label="Mobile Number"
                  value={formik.values.mobile}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur} // ✅ Ensures validation runs
                  error={formik.touched.mobile && Boolean(formik.errors.mobile)}
                  helperText={formik.touched.mobile && formik.errors.mobile}
                  disabled={!emailVerified}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="department"
                  name="department"
                  label="Department"
                  value={formik.values.department}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur} // ✅ Ensures validation runs
                  error={
                    formik.touched.department &&
                    Boolean(formik.errors.department)
                  }
                  helperText={
                    formik.touched.department && formik.errors.department
                  }
                  disabled={!emailVerified}
                >
                  <MenuItem value="CSE">
                    Computer Science and Engineering
                  </MenuItem>
                  <MenuItem value="IT">Information Technology</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="semester"
                  name="semester"
                  label="Semester"
                  type="number"
                  value={formik.values.semester}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.semester && Boolean(formik.errors.semester)
                  }
                  helperText={formik.touched.semester && formik.errors.semester}
                  disabled={!emailVerified}
                >
                  <MenuItem value="5">5</MenuItem>
                  <MenuItem value="7">7</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="gender"
                  name="gender"
                  label="Gender"
                  select
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur} // ✅ Ensures validation runs
                  error={formik.touched.gender && Boolean(formik.errors.gender)}
                  helperText={formik.touched.gender && formik.errors.gender}
                  disabled={!emailVerified}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="section"
                  name="section"
                  label="Section"
                  value={formik.values.section}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur} // ✅ Ensures validation runs
                  error={
                    formik.touched.section && Boolean(formik.errors.section)
                  }
                  helperText={formik.touched.section && formik.errors.section}
                  disabled={!emailVerified}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="nocType"
                  name="nocType"
                  label="NOC Type"
                  value={formik.values.nocType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur} // ✅ Ensures validation runs
                  error={
                    formik.touched.nocType && Boolean(formik.errors.nocType)
                  }
                  helperText={formik.touched.nocType && formik.errors.nocType}
                  disabled={!emailVerified}
                >
                  <MenuItem value="Specific">
                    Specific
                    <Tooltip title={NOC_TYPE_INFO.Specific} placement="right">
                      <InfoIcon sx={{ ml: 1, fontSize: 16, color: "#666" }} />
                    </Tooltip>
                  </MenuItem>
                  <MenuItem value="Generic">
                    Generic
                    <Tooltip title={NOC_TYPE_INFO.Generic} placement="right">
                      <InfoIcon sx={{ ml: 1, fontSize: 16, color: "#666" }} />
                    </Tooltip>
                  </MenuItem>
                </TextField>
              </Grid>

              {formik.values.nocType === "Specific" && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="cgpa"
                      name="cgpa"
                      label="CGPA"
                      value={formik.values.cgpa}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.cgpa && Boolean(formik.errors.cgpa)}
                      helperText={formik.touched.cgpa && formik.errors.cgpa}
                      disabled={!emailVerified}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="backlogs"
                      name="backlogs"
                      label="Number of Backlogs"
                      value={formik.values.backlogs}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.backlogs &&
                        Boolean(formik.errors.backlogs)
                      }
                      helperText={
                        formik.touched.backlogs && formik.errors.backlogs
                      }
                      disabled={!emailVerified}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="offerType"
                  name="offerType"
                  label="Offer Type"
                  value={formik.values.offerType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur} // ✅ Ensures validation runs
                  error={
                    formik.touched.offerType && Boolean(formik.errors.offerType)
                  }
                  helperText={
                    formik.touched.offerType && formik.errors.offerType
                  }
                  disabled={!emailVerified}
                >
                  <MenuItem value="On-Campus">On-Campus</MenuItem>
                  <MenuItem value="Off-Campus">Off-Campus</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="companyName"
                  name="companyName"
                  label="Company Name"
                  value={formik.values.companyName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur} // ✅ Ensures validation runs
                  error={
                    formik.touched.companyName &&
                    Boolean(formik.errors.companyName)
                  }
                  helperText={
                    formik.touched.companyName && formik.errors.companyName
                  }
                  disabled={!emailVerified}
                />
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  {" "}
                  {/* Controls spacing between items */}
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      id="companyCity"
                      name="companyCity"
                      label="Company City"
                      value={formik.values.companyCity}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur} // ✅ Ensures validation runs
                      error={
                        formik.touched.companyCity &&
                        Boolean(formik.errors.companyCity)
                      }
                      helperText={
                        formik.touched.companyCity && formik.errors.companyCity
                      }
                      disabled={!emailVerified}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      id="companyState"
                      name="companyState"
                      label="Company State"
                      value={formik.values.companyState}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur} // ✅ Ensures validation runs
                      error={
                        formik.touched.companyState &&
                        Boolean(formik.errors.companyState)
                      }
                      helperText={
                        formik.touched.companyState &&
                        formik.errors.companyState
                      }
                      disabled={!emailVerified}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      id="companyPin"
                      name="companyPin"
                      label="PIN Code"
                      value={formik.values.companyPin}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur} // ✅ Ensures validation runs
                      error={
                        formik.touched.companyPin &&
                        Boolean(formik.errors.companyPin)
                      }
                      helperText={
                        formik.touched.companyPin && formik.errors.companyPin
                      }
                      disabled={!emailVerified}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="internshipType"
                  name="internshipType"
                  label="Internship Type"
                  value={formik.values.internshipType}
                  onBlur={formik.handleBlur} // ✅ Ensures validation runs
                  onChange={formik.handleChange}
                  error={
                    formik.touched.internshipType &&
                    Boolean(formik.errors.internshipType)
                  }
                  helperText={
                    formik.touched.internshipType &&
                    formik.errors.internshipType
                  }
                  disabled={!emailVerified}
                >
                  <MenuItem value="Internship Only">Internship Only</MenuItem>
                  <MenuItem value="Internship with PPO">
                    Internship with PPO
                  </MenuItem>
                </TextField>
              </Grid>
              {formik.values.internshipType === "Internship with PPO" && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="ppoPackage"
                    name="ppoPackage"
                    label="PPO Package (LPA)"
                    type="number"
                    value={formik.values.ppoPackage}
                    onBlur={formik.handleBlur} // ✅ Ensures validation runs
                    onChange={formik.handleChange}
                    error={
                      formik.touched.ppoPackage &&
                      Boolean(formik.errors.ppoPackage)
                    }
                    helperText={
                      formik.touched.ppoPackage && formik.errors.ppoPackage
                    }
                    disabled={!emailVerified}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="stipend"
                  name="stipend"
                  label="Stipend (₹ per month)"
                  onBlur={formik.handleBlur} // ✅ Ensures validation runs
                  type="number"
                  value={formik.values.stipend}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.stipend && Boolean(formik.errors.stipend)
                  }
                  helperText={formik.touched.stipend && formik.errors.stipend}
                  disabled={!emailVerified}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="startDate"
                  name="startDate"
                  label="Start Date"
                  type="date"
                  value={formik.values.startDate}
                  onBlur={formik.handleBlur} // ✅ Ensures validation runs
                  onChange={formik.handleChange}
                  error={
                    formik.touched.startDate && Boolean(formik.errors.startDate)
                  }
                  helperText={
                    formik.touched.startDate && formik.errors.startDate
                  }
                  InputLabelProps={{ shrink: true }}
                  disabled={!emailVerified}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="endDate"
                  name="endDate"
                  label="End Date"
                  type="date"
                  value={formik.values.endDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur} // ✅ Ensures validation runs
                  error={
                    formik.touched.endDate && Boolean(formik.errors.endDate)
                  }
                  helperText={formik.touched.endDate && formik.errors.endDate}
                  InputLabelProps={{ shrink: true }}
                  disabled={!emailVerified}
                />
              </Grid>
              {/* HRD Contact Section */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="hrdEmail"
                  name="hrdEmail"
                  label="HRD Email"
                  value={formik.values.hrdEmail}
                  onBlur={formik.handleBlur} // ✅ Ensures validation runs
                  onChange={formik.handleChange}
                  error={
                    formik.touched.hrdEmail && Boolean(formik.errors.hrdEmail)
                  }
                  helperText={formik.touched.hrdEmail && formik.errors.hrdEmail}
                  disabled={!emailVerified}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="hrdNumber"
                  name="hrdNumber"
                  label="HRD Contact Number"
                  value={formik.values.hrdNumber}
                  onBlur={formik.handleBlur} // ✅ Ensures validation runs
                  onChange={formik.handleChange}
                  error={
                    formik.touched.hrdNumber && Boolean(formik.errors.hrdNumber)
                  }
                  helperText={
                    formik.touched.hrdNumber && formik.errors.hrdNumber
                  }
                  disabled={!emailVerified}
                />
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  {formik.values.nocType === "Specific" && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        Offer Letter (PDF with no spaces required)
                      </Typography>
                      <input
                        accept="application/pdf"
                        type="file"
                        onChange={handleOfferLetterChange}
                        required={formik.values.nocType === "Specific"}
                        disabled={!emailVerified}
                      />
                      {fileError && (
                        <Typography
                          color="error"
                          variant="caption"
                          sx={{ display: "block", mt: 1, ml: 2 }}
                        >
                          {fileError}
                        </Typography>
                      )}
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Mail Copy (PDF only, required)
                    </Typography>
                    <input
                      accept="application/pdf"
                      type="file"
                      onChange={handleMailCopyChange}
                      required
                      disabled={!emailVerified}
                    />
                    {fileError && (
                      <Typography
                        color="error"
                        variant="caption"
                        sx={{ display: "block", mt: 1, ml: 2 }}
                      >
                        {fileError}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      id="termsAccepted"
                      name="termsAccepted"
                      checked={formik.values.termsAccepted}
                      onChange={formik.handleChange}
                      disabled={!emailVerified}
                    />
                  }
                  label="I hereby declare that all the information provided is true to the best of my knowledge"
                />
                {formik.touched.termsAccepted &&
                  formik.errors.termsAccepted && (
                    <Typography color="error" variant="caption" display="block">
                      {formik.errors.termsAccepted}
                    </Typography>
                  )}
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  size="large"
                  sx={{ backgroundColor: "#d05c24" }}
                  fullWidth
                  className="submit-button"
                  disabled={isSubmitting || !formik.values.termsAccepted}
                  // disabled={!formik.isValid || !formik.values.termsAccepted}
                >
                  {isSubmitting ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <CircularProgress size={20} sx={{ color: "white" }} />
                      <span>Submitting Application...</span>
                    </Box>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

export default StudentForm;
