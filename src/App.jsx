import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentForm from './components/StudentForm';
import ReviewerPortal from './components/ReviewerPortal';
import HodPortal from './components/HodPortal';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentForm />} />
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
    </Router>
  );
}

export default App;