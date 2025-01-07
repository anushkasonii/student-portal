import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const isAuthenticated = true;
  const userRole = role;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (isAuthenticated && role !== userRole) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;