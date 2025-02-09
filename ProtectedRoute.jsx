import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, role }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');



  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (role && role !== userRole && userRole !== "admin") {
    return <Navigate to="/login" />;
  }
  
  
  

  return children;
}

export default ProtectedRoute;