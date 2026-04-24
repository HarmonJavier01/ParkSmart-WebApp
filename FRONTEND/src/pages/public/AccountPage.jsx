import { useState } from 'react';
import { User, LogIn, UserPlus, Save } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import authService from '../../services/authService.js';
import useReservations from '../../hooks/useReservations.js';
import ReservationCard from '../../components/reservation/ReservationCard.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import InputField from '../../components/forms/InputField.jsx';

const AccountPage = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  const { reservations, loading: resLoading, cancelReservation, refetch } = useReservations(user?._id);

  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', phone: '', password: '' });
  const [profileData, setProfileData] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await authService.login(loginData);
      login(res.user, res.token);
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await authService.register(registerData);
      login(res.user, res.token);
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this reservation?')) return;
    await cancelReservation(id);
    refetch();
  };

  if (isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-teal-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="ml-auto flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
          >
            <LogIn className="w-4 h-4" /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="card">
              <h3 className="font-bold mb-4">Profile</h3>
              <div className="space-y-3">
                <InputField
                  label="Name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
                <InputField
                  label="Phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
                <button className="w-full btn-secondary text-sm flex items-center justify-center gap-1">
                  <Save className="w-4 h-4" /> Update Profile
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-bold text-lg mb-4">My Reservations</h3>
            {resLoading ? (
              <LoadingSpinner />
            ) : reservations.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No reservations yet</p>
            ) : (
              <div className="space-y-4">
                {reservations.map((res) => (
                  <ReservationCard
                    key={res._id}
                    reservation={res}
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="card">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 pb-3 text-sm font-medium ${activeTab === 'login' ? 'text-parking-primary border-b-2 border-parking-primary' : 'text-gray-500'}`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 pb-3 text-sm font-medium ${activeTab === 'register' ? 'text-parking-primary border-b-2 border-parking-primary' : 'text-gray-500'}`}
          >
            Register
          </button>
        </div>

        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <InputField
              label="Email"
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              required
            />
            <InputField
              label="Password"
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              required
            />
            <button type="submit" disabled={submitting} className="w-full btn-primary">
              {submitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <InputField
              label="Full Name"
              value={registerData.name}
              onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
              required
            />
            <InputField
              label="Email"
              type="email"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              required
            />
            <InputField
              label="Phone"
              value={registerData.phone}
              onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
              required
            />
            <InputField
              label="Password"
              type="password"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              required
            />
            <button type="submit" disabled={submitting} className="w-full btn-primary">
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AccountPage;

