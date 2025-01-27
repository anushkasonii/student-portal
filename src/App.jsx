import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentForm from './components/StudentForm';
import SpcPortal from './components/SpcPortal';
import HodPortal from './components/HodPortal';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPortal from './components/AdminPortal'; // Import AdminPortal

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentForm />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/spc"
          element={
            <ProtectedRoute role="spc">
              <SpcPortal />
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
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin"> {/* Protect the AdminPortal */}
              <AdminPortal />
            </ProtectedRoute>
          }
        />
     
      </Routes>
    </Router>
  );
}

export default App;