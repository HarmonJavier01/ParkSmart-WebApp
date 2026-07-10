import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import authService from '../../services/authService.js';
import useAuth from '../../hooks/useAuth.js';
import InputField from '../../components/forms/InputField.jsx';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { user, login, isAuthenticated, loading: authLoading } = useAuth();
  const [data, setData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'superadmin' || user?.role === 'lot_operator')) {
      navigate('/admin');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await authService.adminLogin(data);
      login(res.user, res.token);
      navigate('/admin');
    } catch (err) {
      alert(err.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-teal-700" />
          </div>
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-sm text-gray-500">ParkSmart Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Email"
            type="email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            required
          />
          <InputField
            label="Password"
            type="password"
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
            required
          />
          <button type="submit" disabled={loading} className="w-full btn-primary">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link 
            to="/account" 
            className="text-sm font-semibold text-gray-500 hover:text-teal-600 transition duration-150"
          >
            Sign In as User
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

