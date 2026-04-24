import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  return children;
};

export default ProtectedRoute;

