import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  console.log("ProtectedRoute Rendered"); // Debugging log

  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const userRole = localStorage.getItem("userRole");

  console.log("isAuthenticated:", isAuthenticated);
  console.log("Stored userRole:", userRole);
  console.log("Required role:", role);

  if (!isAuthenticated) {
    console.warn("User not authenticated, redirecting to login...");
    return <Navigate to="/login" replace />;
  }

  if (role && role !== userRole) {
    console.warn("User role mismatch, redirecting to login...");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
