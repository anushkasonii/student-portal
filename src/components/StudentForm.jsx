import { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Grid,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useFormik } from "formik";
import * as yup from "yup";

const validationSchema = yup.object({
  registrationNumber: yup.string().required("Registration number is required"),
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  mobile: yup
    .string()
    .matches(/^\d{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  department: yup.string().required("Department is required"),
  section: yup.string().required("Section is required"),
  offerType: yup.string().required("Offer type is required"),
  companyName: yup.string().required("Company name is required"),
  companyAddress: yup.string().required("Company address is required"),
  internshipType: yup.string().required("Internship type is required"),
  ppoPackage: yup.number().when("internshipType", {
    is: "Internship with PPO",
    then: (schema) => schema.required("PPO package is required"),
  }),
  stipend: yup.number().required("Stipend amount is required"),
  startDate: yup.date().required("Start date is required"),
  endDate: yup.date().required("End date is required"),
  termsAccepted: yup
    .boolean()
    .oneOf([true], "Must accept terms and conditions"),
});

export default function StudentForm() {
  const [offerLetter, setOfferLetter] = useState(null);
  const [mailCopy, setMailCopy] = useState(null);

  const formik = useFormik({
    initialValues: {
      registrationNumber: "",
      name: "",
      email: "",
      mobile: "",
      department: "",
      section: "",
      offerType: "",
      companyName: "",
      companyAddress: "",
      internshipType: "",
      ppoPackage: "",
      stipend: "",
      startDate: null,
      endDate: null,
      termsAccepted: false,
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log(values, offerLetter, mailCopy);
    },
  });

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (type === "offer") {
      setOfferLetter(file);
    } else {
      setMailCopy(file);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Student Internship Application
        </Typography>
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
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="registrationNumber"
                name="registrationNumber"
                label="Registration Number"
                value={formik.values.registrationNumber}
                onChange={formik.handleChange}
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

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Official Mail ID"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="mobile"
                name="mobile"
                label="Mobile Number"
                value={formik.values.mobile}
                onChange={formik.handleChange}
                error={formik.touched.mobile && Boolean(formik.errors.mobile)}
                helperText={formik.touched.mobile && formik.errors.mobile}
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
                error={
                  formik.touched.department && Boolean(formik.errors.department)
                }
                helperText={
                  formik.touched.department && formik.errors.department
                }
              >
                <MenuItem value="CSE">CSE</MenuItem>
                <MenuItem value="IT">IT</MenuItem>
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
                error={formik.touched.section && Boolean(formik.errors.section)}
                helperText={formik.touched.section && formik.errors.section}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                id="offerType"
                name="offerType"
                label="Offer Type"
                value={formik.values.offerType}
                onChange={formik.handleChange}
                error={
                  formik.touched.offerType && Boolean(formik.errors.offerType)
                }
                helperText={formik.touched.offerType && formik.errors.offerType}
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
                error={
                  formik.touched.companyName &&
                  Boolean(formik.errors.companyName)
                }
                helperText={
                  formik.touched.companyName && formik.errors.companyName
                }
              />
            </Grid>
            <Typography  sx={{ marginTop: 2, marginLeft: 3, fontSize: '17px' }}>
            Company Address
            </Typography>

            <Grid container spacing={2}sx={{ marginLeft: 1 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  id="city"
                  name="city"
                  label="City"
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  error={formik.touched.city && Boolean(formik.errors.city)}
                  helperText={formik.touched.city && formik.errors.city}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  id="state"
                  name="state"
                  label="State"
                  value={formik.values.state}
                  onChange={formik.handleChange}
                  error={formik.touched.state && Boolean(formik.errors.state)}
                  helperText={formik.touched.state && formik.errors.state}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  id="pin"
                  name="pin"
                  label="PIN"
                  value={formik.values.pin}
                  onChange={formik.handleChange}
                  error={formik.touched.pin && Boolean(formik.errors.pin)}
                  helperText={formik.touched.pin && formik.errors.pin}
                />
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
                onChange={formik.handleChange}
                error={
                  formik.touched.internshipType &&
                  Boolean(formik.errors.internshipType)
                }
                helperText={
                  formik.touched.internshipType && formik.errors.internshipType
                }
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
                  onChange={formik.handleChange}
                  error={
                    formik.touched.ppoPackage &&
                    Boolean(formik.errors.ppoPackage)
                  }
                  helperText={
                    formik.touched.ppoPackage && formik.errors.ppoPackage
                  }
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="stipend"
                name="stipend"
                label="Stipend (Thousands)"
                type="number"
                value={formik.values.stipend}
                onChange={formik.handleChange}
                error={formik.touched.stipend && Boolean(formik.errors.stipend)}
                helperText={formik.touched.stipend && formik.errors.stipend}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Start Date"
                value={formik.values.startDate}
                onChange={(value) => formik.setFieldValue("startDate", value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={
                      formik.touched.startDate &&
                      Boolean(formik.errors.startDate)
                    }
                    helperText={
                      formik.touched.startDate && formik.errors.startDate
                    }
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="End Date"
                value={formik.values.endDate}
                onChange={(value) => formik.setFieldValue("endDate", value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={
                      formik.touched.endDate && Boolean(formik.errors.endDate)
                    }
                    helperText={formik.touched.endDate && formik.errors.endDate}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                component="label"
                fullWidth
                sx={{ height: "56px" }}
              >
                Upload Offer Letter
                <input
                  type="file"
                  hidden
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, "offer")}
                />
              </Button>
              {offerLetter && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  {offerLetter.name}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                component="label"
                fullWidth
                sx={{ height: "56px" }}
              >
                Upload Mail Copy
                <input
                  type="file"
                  hidden
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, "mail")}
                />
              </Button>
              {mailCopy && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  {mailCopy.name}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="termsAccepted"
                    checked={formik.values.termsAccepted}
                    onChange={formik.handleChange}
                  />
                }
                label="I accept the terms and conditions"
              />
              {formik.touched.termsAccepted && formik.errors.termsAccepted && (
                <Typography color="error" variant="caption" display="block">
                  {formik.errors.termsAccepted}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={
                  !formik.isValid ||
                  !formik.dirty ||
                  !formik.values.termsAccepted
                }
              >
                Submit Application
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}
