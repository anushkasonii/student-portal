import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import StudentForm from "./components/StudentForm";
import FpcPortal from "./components/FpcPortal";
import HodPortal from "./components/HodPortal";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPortal from "./components/AdminPortal"; // Import AdminPortal
import SuccessPage from "./components/SuccessPage";

function App() {
  return (
    <HashRouter basename="/student-portal">
      <Routes>
        <Route path="/" element={<StudentForm />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/fpc"
          element={
            <ProtectedRoute role="fpc">
              <FpcPortal />
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
            <ProtectedRoute role="admin">
              <AdminPortal />
            </ProtectedRoute>
          }
        />
      </Routes>
      </HashRouter>
  );
}

export default App;