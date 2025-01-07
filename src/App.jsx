import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';

import StudentForm from './components/StudentForm';
import ReviewerPortal from './components/ReviewerPortal';
import HodPortal from './components/HodPortal';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<StudentForm />} />
            {/* <Route path="/" element={<Login />} /> */}
            <Route path="/login" element={<Login />} />
            <Route
              path="/reviewer"
              element={
                <ProtectedRoute role="reviewer">
                  <ReviewerPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod"
              element={
                <ProtectedRoute role="hod">
                  <HodPortal />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;