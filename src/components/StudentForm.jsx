import { useState } from 'react';
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
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { submitApplication } from '../services/api';
import { api } from '../services/api'; // Adjust the path if necessary.





const validationSchema = yup.object({
  registrationNumber: yup.string().required('Registration number is required'),
  name: yup.string().required('Name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  mobile: yup
    .string()
    .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits')
    .required('Mobile number is required'),
  department: yup.string().required('Department is required'),
  section: yup.string().required('Section is required'),
  offerType: yup.string().required('Offer type is required'),
  companyName: yup.string().required('Company name is required'),
  companyCity: yup.string().required('City is required'),
  companyState: yup.string().required('State is required'),
  companyPin: yup
    .string()
    .matches(/^[0-9]{6}$/, 'PIN code must be 6 digits')
    .required('PIN code is required'),
  internshipType: yup.string().required('Internship type is required'),
  ppoPackage: yup.number().when('internshipType', {
    is: 'Internship with PPO',
    then: () => yup.number()
      .required('PPO package is required')
      .positive('Package must be positive')
      .typeError('Please enter a valid number'),
  }),
  stipend: yup
    .number()
    .required('Stipend amount is required')
    .positive('Stipend must be positive')
    .typeError('Please enter a valid number'),
  startDate: yup.date()
    .required('Start date is required')
    .min(new Date(), 'Start date cannot be in the past'),
  endDate: yup.date()
    .required('End date is required'),
    //.min(yup.ref('startDate'), 'End date must be after start date'),
  termsAccepted: yup.boolean().oneOf([true], 'Must accept terms and conditions'),
});

function StudentForm() {
  const SUPPORTED_FORMATS = ['application/pdf'];
const FILE_SIZE = 5 * 1024 * 1024; // 5MB
const [formErrors, setFormErrors] = useState([]);
  const [state, setState] = useState('');
  const [offerLetter, setOfferLetter] = useState(null);
  const [mailCopy, setMailCopy] = useState(null);
  const [fileError, setFileError] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState('');

  const validateFile = (file) => {
    if (!file) return 'File is required';
    if (!SUPPORTED_FORMATS.includes(file.type)) return 'File must be a PDF';
    if (file.size > FILE_SIZE) return 'File size must be less than 5MB';
    return '';
  };

  const formik = useFormik({
    initialValues: {
      registrationNumber: '',
      name: '',
      email: '',
      mobile: '',
      department: '',
      section: '',
      offerType: '',
      companyName: '',
      companyCity: '',
      companyState: '',
      companyPin: '',
      internshipType: '',
      ppoPackage: '',
      stipend: '',
      startDate: '',
      endDate: '',
      termsAccepted: false,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const offerLetterError = validateFile(offerLetter);
      const mailCopyError = validateFile(mailCopy);
      const errors = [];
      if (offerLetterError || mailCopyError) {
        setFileError(offerLetterError || mailCopyError);
        return;
      }
      if (errors.length > 0) {
        setFormErrors(errors);
        return;
      }
      

      // Prepare FormData
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('offerLetter', offerLetter);
      formData.append('mailCopy', mailCopy);

//       try {
//         // Send POST request to /submit
//         // const response = await axios.post('http://localhost:8080/submit', formData, {
//         //   headers: { 'Content-Type': 'multipart/form-data' },
//         // });
//         try {
//           await submitApplication(formData);
//         console.log('Success:', response.data);
//         setSubmissionStatus('Form submitted successfully!');
//       } catch (error) {
//         const errorMessage = error.response?.data?.message || 'Failed to submit the form. Please try again.';
//         console.error('Error details:', error.response?.data || error.message);
//         setSubmissionStatus(errorMessage);
//       }
  
// },
//   });

try {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append('offerLetter', offerLetter);
  formData.append('mailCopy', mailCopy);

  await submitApplication(formData);


  // Reset form
  formik.resetForm();
  setOfferLetter(null);
  setMailCopy(null);
  setFormErrors([]);
  // Show success message
} catch (error) {
  setFormErrors([error.response?.data?.message || 'Failed to submit application']);
}
},
});

  return (
    <Box>
      <Box className="app-header" sx={{ py: 3, backgroundColor: '#1976d2', color: 'white', textAlign: 'center', mb: 1 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>Internship NOC Application Portal</Typography>
      </Box>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom align="center" color="primary">
            Fill in the Details
          </Typography>
          {fileError && <Alert severity="error" sx={{ mb: 2 }}>{fileError}</Alert>}
          {submissionStatus && <Alert severity={submissionStatus.includes('successfully') ? 'success' : 'error'} sx={{ mb: 2 }}>{submissionStatus}</Alert>}
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              {/* Registration Number */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="registrationNumber"
                  name="registrationNumber"
                  label="Registration Number"
                  value={formik.values.registrationNumber}
                  onChange={formik.handleChange}
                  error={formik.touched.registrationNumber && Boolean(formik.errors.registrationNumber)}
                  helperText={formik.touched.registrationNumber && formik.errors.registrationNumber}
                />
              </Grid>
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
                id="email"
                name="email"
                label="Official Email ID"
                type="email"
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
                error={formik.touched.department && Boolean(formik.errors.department)}
                helperText={formik.touched.department && formik.errors.department}
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
                error={formik.touched.offerType && Boolean(formik.errors.offerType)}
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
                error={formik.touched.companyName && Boolean(formik.errors.companyName)}
                helperText={formik.touched.companyName && formik.errors.companyName}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="companyCity"
                name="companyCity"
                label="Company City"
                value={formik.values.companyCity}
                onChange={formik.handleChange}
                error={formik.touched.companyCity && Boolean(formik.errors.companyCity)}
                helperText={formik.touched.companyCity && formik.errors.companyCity}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="companyState"
                name="companyState"
                label="Company State"
                value={formik.values.companyState}
                onChange={formik.handleChange}
                error={formik.touched.companyState && Boolean(formik.errors.companyState)}
                helperText={formik.touched.companyState && formik.errors.companyState}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="companyPin"
                name="companyPin"
                label="PIN Code"
                value={formik.values.companyPin}
                onChange={formik.handleChange}
                error={formik.touched.companyPin && Boolean(formik.errors.companyPin)}
                helperText={formik.touched.companyPin && formik.errors.companyPin}
              />
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
                error={formik.touched.internshipType && Boolean(formik.errors.internshipType)}
                helperText={formik.touched.internshipType && formik.errors.internshipType}
              >
                <MenuItem value="Internship Only">Internship Only</MenuItem>
                <MenuItem value="Internship with PPO">Internship with PPO</MenuItem>
              </TextField>
            </Grid>
            {formik.values.internshipType === 'Internship with PPO' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="ppoPackage"
                  name="ppoPackage"
                  label="PPO Package (LPA)"
                  type="number"
                  value={formik.values.ppoPackage}
                  onChange={formik.handleChange}
                  error={formik.touched.ppoPackage && Boolean(formik.errors.ppoPackage)}
                  helperText={formik.touched.ppoPackage && formik.errors.ppoPackage}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="stipend"
                name="stipend"
                label="Stipend (₹ per month)"
                type="number"
                value={formik.values.stipend}
                onChange={formik.handleChange}
                error={formik.touched.stipend && Boolean(formik.errors.stipend)}
                helperText={formik.touched.stipend && formik.errors.stipend}
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
                onChange={formik.handleChange}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                helperText={formik.touched.startDate && formik.errors.startDate}
                InputLabelProps={{ shrink: true }}
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
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                helperText={formik.touched.endDate && formik.errors.endDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Offer Letter (PDF only)
                </Typography>
                <input
                  accept="application/pdf"
                  type="file"
                  onChange={(e) => setOfferLetter(e.target.files[0])}
                />
              </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                Mail Copy (PDF only)
              </Typography>
              <input
                accept="application/pdf"
                type="file"
                onChange={(e) => setMailCopy(e.target.files[0])}
              />
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
                label="I hereby declare that all the information provided is true to the best of my knowledge"
              />
              {formik.touched.termsAccepted && formik.errors.termsAccepted && (
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
                fullWidth
                className="submit-button"
                //disabled={!formik.isValid || !formik.values.termsAccepted}
              >
                Submit Application
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