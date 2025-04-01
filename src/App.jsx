import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudentForm from "./components/StudentForm";
import FpcPortal from "./components/FpcPortal";
import HodPortal from "./components/HodPortal";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPortal from "./components/AdminPortal";
import SuccessPage from "./components/SuccessPage";
import HomePage from "./components/HomePage";

function App() {
  console.log("App working...");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/student-form" element={<StudentForm />} />
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
        {/* <Route path="/admin" element={<AdminPortal />} /> */}

        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
