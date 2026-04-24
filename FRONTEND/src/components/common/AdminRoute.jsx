import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { isAdmin } from '../../constants/roles.js';
import Sidebar from './Sidebar.jsx';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || !isAdmin(user?.role)) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminRoute;

