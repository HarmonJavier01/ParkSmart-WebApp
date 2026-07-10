import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  User, 
  LogIn, 
  UserPlus, 
  Save, 
  KeyRound, 
  ArrowLeft, 
  ArrowRight,
  Car, 
  CalendarCheck, 
  MapPin, 
  LogOut, 
  ChevronRight 
} from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import authService from '../../services/authService.js';
import useReservations from '../../hooks/useReservations.js';
import ReservationCard from '../../components/reservation/ReservationCard.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import InputField from '../../components/forms/InputField.jsx';
import ParkingSearchPage from './ParkingSearchPage.jsx';

const AccountPage = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { reservations, loading: resLoading, cancelReservation, refetch } = useReservations(user?._id);
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState('login');
  const [activeSubTab, setActiveSubTab] = useState('reservations');
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', phone: '', password: '' });
  const [profileData, setProfileData] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [submitting, setSubmitting] = useState(false);
  const [verificationMode, setVerificationMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Sync profile data when authenticated user details are loaded
  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name || '', phone: user.phone || '' });
    }
  }, [user]);

  // Sync activeSubTab with url tab parameter (e.g. ?tab=parking)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['reservations', 'parking', 'profile'].includes(tabParam)) {
      setActiveSubTab(tabParam);
    }
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await authService.login(loginData);
      login(res.user, res.token);
      
      // Redirect admins and operators to the admin dashboard
      if (res.user.role === 'superadmin' || res.user.role === 'lot_operator') {
        navigate('/admin');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '896000000000-exampleid.apps.googleusercontent.com';
    const redirectUri = `${window.location.origin}/google-callback`;
    const scope = 'openid email profile';
    const responseType = 'token';
    const state = Math.random().toString(36).substring(2, 15);
    
    localStorage.setItem('oauth_state', state);

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=${encodeURIComponent(responseType)}` +
      `&scope=${encodeURIComponent(scope)}` +
      `&state=${encodeURIComponent(state)}`;
      
    window.location.href = googleAuthUrl;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await authService.register(registerData);
      setRegisteredEmail(registerData.email);
      setVerificationMode(true);
      // Auto-fill OTP if returned by backend (dev mode - Resend free tier limitation)
      if (res.otp) {
        setOtp(res.otp);
        alert(`Registration successful! Your verification code is: ${res.otp}`);
      } else {
        alert(res.message || 'Registration successful! Check your email for the 6-digit verification code.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await authService.verifyOTP(registeredEmail, otp);
      login(res.user, res.token);
      alert(res.message);
      
      // Redirect admins and operators to the admin dashboard
      if (res.user.role === 'superadmin' || res.user.role === 'lot_operator') {
        navigate('/admin');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setSubmitting(true);
      const res = await authService.resendOTP(registeredEmail);
      alert(res.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resend OTP');
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
      <div className="min-h-[calc(100vh-4rem)] flex bg-gray-50/40 font-outfit relative overflow-x-hidden">
        {/* Premium Left Hover Guide Strip (Desktop guide only) */}
        <div 
          className="fixed left-0 top-16 bottom-0 w-2.5 bg-gradient-to-b from-parking-primary/10 to-parking-secondary/10 hover:from-parking-primary/35 hover:to-parking-secondary/35 transition-all z-40 cursor-pointer hidden md:block shadow-xs border-r border-gray-200/20"
          onMouseEnter={() => setSidebarHovered(true)}
        />

        {/* Hover-activated Slide-out Left Sidebar Menu */}
        <aside 
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
          className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-100 flex flex-col justify-between z-50 shadow-2xl transition-all duration-300 ease-in-out hidden md:flex ${
            sidebarHovered ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'
          }`}
        >
          <div>
            {/* User Info Header */}
            <div className="p-6 border-b border-gray-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-parking-primary/10 rounded-full flex items-center justify-center border border-parking-primary/15 mb-3 shadow-xs">
                <User className="w-8 h-8 text-parking-primary" />
              </div>
              <h3 className="font-extrabold text-gray-800 text-base truncate max-w-full leading-snug">{user?.name}</h3>
              <p className="text-xs text-gray-400 font-semibold truncate max-w-full mt-0.5">{user?.email}</p>
              <span className="text-[10px] text-parking-primary font-black tracking-widest uppercase bg-parking-primary/10 border border-parking-primary/20 px-2.5 py-0.5 rounded-full mt-2.5 inline-block">
                {user?.role}
              </span>
            </div>

            {/* User Navigation menu */}
            <nav className="p-4 space-y-1.5 font-bold">
              <button
                onClick={() => {
                  setActiveSubTab('reservations');
                  setSidebarHovered(false);
                }}
                className={`flex items-center justify-between w-full p-3.5 rounded-2xl transition group ${
                  activeSubTab === 'reservations' 
                    ? 'bg-parking-primary/10 text-parking-primary border border-parking-primary/5' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CalendarCheck className={`w-5 h-5 ${activeSubTab === 'reservations' ? 'text-parking-primary' : 'text-gray-400 group-hover:scale-105 transition-transform'}`} />
                  <span className="text-sm">My Reservations</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${activeSubTab === 'reservations' ? 'text-parking-primary translate-x-0.5' : 'text-gray-300 group-hover:translate-x-0.5'}`} />
              </button>

              <button
                onClick={() => {
                  setActiveSubTab('parking');
                  setSidebarHovered(false);
                }}
                className={`flex items-center justify-between w-full p-3.5 rounded-2xl transition group ${
                  activeSubTab === 'parking' 
                    ? 'bg-parking-primary/10 text-parking-primary border border-parking-primary/5' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className={`w-5 h-5 ${activeSubTab === 'parking' ? 'text-parking-primary' : 'text-gray-400 group-hover:scale-105 transition-transform'}`} />
                  <span className="text-sm">Find Parking</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${activeSubTab === 'parking' ? 'text-parking-primary translate-x-0.5' : 'text-gray-300 group-hover:translate-x-0.5'}`} />
              </button>

              <button
                onClick={() => {
                  setActiveSubTab('profile');
                  setSidebarHovered(false);
                }}
                className={`flex items-center justify-between w-full p-3.5 rounded-2xl transition group ${
                  activeSubTab === 'profile' 
                    ? 'bg-parking-primary/10 text-parking-primary border border-parking-primary/5' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <User className={`w-5 h-5 ${activeSubTab === 'profile' ? 'text-parking-primary' : 'text-gray-400 group-hover:scale-105 transition-transform'}`} />
                  <span className="text-sm">Profile Settings</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${activeSubTab === 'profile' ? 'text-parking-primary translate-x-0.5' : 'text-gray-300 group-hover:translate-x-0.5'}`} />
              </button>
            </nav>
          </div>

          {/* User Sidebar Footer Logout */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-red-500/5 hover:bg-red-500/10 text-red-500 hover:text-red-600 transition font-extrabold text-sm border border-red-500/10 hover:border-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Content Section (Fully spreads out across screen width) */}
        <main className={`flex-1 p-6 md:p-8 overflow-y-auto w-full transition-all duration-300 pl-6 md:pl-14 ${activeSubTab === 'parking' ? 'max-w-none' : 'max-w-7xl mx-auto'}`}>
          {/* Responsive Profile Banner for Mobile View */}
          <div className="md:hidden flex items-center justify-between pb-6 mb-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-parking-primary/10 flex items-center justify-center border border-parking-primary/15">
                <User className="w-5 h-5 text-parking-primary" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-gray-800 truncate leading-snug">{user?.name}</h4>
                <p className="text-xs text-gray-400 font-semibold truncate leading-none mt-0.5">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-red-500 font-extrabold bg-red-50 px-3 py-2 rounded-xl border border-red-100 hover:bg-red-100 hover:text-red-600 transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>

          {/* Tabs Selector on Mobile Screens */}
          <div className="md:hidden bg-gray-100/80 p-1.5 rounded-2xl flex mb-6 relative">
            <button
              onClick={() => setActiveSubTab('reservations')}
              className={`flex-grow py-3 text-xs font-black tracking-wider uppercase text-center rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeSubTab === 'reservations' 
                  ? 'bg-white text-parking-primary shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <CalendarCheck className="w-4 h-4" /> Reservations
            </button>
            <button
              onClick={() => setActiveSubTab('parking')}
              className={`flex-grow py-3 text-xs font-black tracking-wider uppercase text-center rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeSubTab === 'parking' 
                  ? 'bg-white text-parking-primary shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <MapPin className="w-4 h-4" /> Find Parking
            </button>
            <button
              onClick={() => setActiveSubTab('profile')}
              className={`flex-grow py-3 text-xs font-black tracking-wider uppercase text-center rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeSubTab === 'profile' 
                  ? 'bg-white text-parking-primary shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <User className="w-4 h-4" /> Profile
            </button>
          </div>

          {/* Sub-Tab Rendering area */}
          {activeSubTab === 'reservations' ? (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-black text-gray-800">My Reservations</h2>
                <p className="text-sm text-gray-500 mt-1">View your current active slots, completed trips, and tickets</p>
              </div>

              {resLoading ? (
                <div className="py-16 flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : reservations.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-100 shadow-xs rounded-2xl">
                  <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 font-semibold">No reservations recorded yet</p>
                  <button onClick={() => setActiveSubTab('parking')} className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold mt-4 shadow-md shadow-parking-primary/20">
                    Find a Parking Slot
                  </button>
                </div>
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
          ) : activeSubTab === 'parking' ? (
            <div className="animate-fade-in -mx-4 md:-mx-8 pt-4 md:pt-6">
              <ParkingSearchPage isTab={true} />
            </div>
          ) : (
            <div className="max-w-xl animate-fade-in">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-800">Profile Settings</h2>
                <p className="text-sm text-gray-500 mt-1">Keep your contact details and account information up to date</p>
              </div>

              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 space-y-4">
                <InputField
                  label="Full Name"
                  placeholder="Your Name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
                <InputField
                  label="Phone Number"
                  placeholder="09171234567"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
                <button className="w-full py-3.5 bg-gradient-to-r from-parking-primary to-parking-secondary hover:brightness-110 active:scale-95 text-white font-extrabold rounded-xl shadow-md shadow-parking-primary/10 hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4">
                  <Save className="w-4 h-4" /> Save Profile Changes
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-white font-outfit overflow-hidden">
      {/* Left Panel: Forms */}
      <div className="w-full md:w-[45%] lg:w-[40%] p-8 md:p-12 xl:p-16 flex flex-col justify-between min-h-screen bg-white">
        
        {/* Logo Header */}
        <div className="flex items-center">
          <div className="w-10 h-10 bg-[#063b31] rounded-xl flex items-center justify-center text-white">
            <Car className="w-5 h-5 text-teal-300" />
          </div>
          <span className="ml-3 font-extrabold text-xl tracking-wider text-[#063b31]">PARKSMART</span>
        </div>

        {/* Form Container */}
        <div className="my-auto py-8">
          <h2 className="text-3xl font-black text-gray-900 mb-6">
            {verificationMode 
              ? 'Verify Account' 
              : activeTab === 'register' 
                ? 'Sign Up' 
                : 'Sign In'}
          </h2>

          {/* Tab Selector */}
          {!verificationMode && (
            <div className="flex items-center gap-6 border-b border-gray-100 pb-3 mb-8 text-xs font-bold tracking-wider">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`transition-colors uppercase pb-2 relative ${
                  activeTab === 'login' 
                    ? 'text-gray-900 border-b-2 border-[#063b31]' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Username
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`transition-colors uppercase pb-2 relative ${
                  activeTab === 'register' 
                    ? 'text-gray-900 border-b-2 border-[#063b31]' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className={`transition-colors uppercase pb-2 relative ${
                  activeTab === 'admin' 
                    ? 'text-gray-900 border-b-2 border-[#063b31]' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Admin Login
              </button>
            </div>
          )}

          {verificationMode ? (
            /* OTP Verification Form */
            <div className="space-y-6">
              <p className="text-gray-500 text-sm leading-relaxed">
                We've sent a 6-digit verification code to <span className="font-semibold text-gray-800">{registeredEmail}</span>
              </p>

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    6-Digit OTP
                  </label>
                  <input
                    type="text"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    placeholder="000000"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063b31] focus:border-transparent transition text-center text-xl tracking-[0.5em] font-mono text-gray-700 bg-white"
                  />
                </div>
                
                <div className="flex justify-center">
                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-14 h-14 bg-[#063b31] hover:bg-[#042c25] active:scale-95 text-white rounded-2xl shadow-lg flex items-center justify-center transition-all cursor-pointer"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </form>

              <div className="flex flex-col gap-3 pt-4 text-center">
                <button 
                  onClick={handleResendOTP}
                  disabled={submitting}
                  className="text-xs text-parking-primary font-bold hover:underline transition"
                >
                  Didn't get the code? Resend
                </button>
                <button 
                  onClick={() => setVerificationMode(false)}
                  className="text-xs text-gray-400 flex items-center justify-center gap-1.5 hover:text-gray-600 transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Registration
                </button>
              </div>
            </div>
          ) : activeTab === 'login' || activeTab === 'admin' ? (
            /* Login Form */
            <div className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Username
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your username"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063b31] focus:border-transparent transition text-sm font-medium text-gray-700 bg-white"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Password
                    </label>
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063b31] focus:border-transparent transition text-sm font-medium text-gray-700 bg-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  {/* Google Login Icon Button */}
                  <button 
                    type="button" 
                    onClick={handleGoogleLogin}
                    className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 transition bg-white"
                    title="Sign in with Google"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.115-5.187 4.115-3.4 0-6.159-2.759-6.159-6.16s2.759-6.16 6.16-6.16c1.654 0 3.12.656 4.22 1.722l3.056-3.056C19.299 1.77 15.992 0 12.24 0c-6.62 0-12 5.38-12 12s5.38 12 12 12c5.56 0 10.22-3.82 11.45-9.01H12.24z"/>
                    </svg>
                  </button>

                  {/* Stay Signed In Checkbox */}
                  <div className="flex items-center gap-2">
                    <input 
                      id="stay-signed-in" 
                      type="checkbox" 
                      className="w-4 h-4 text-[#063b31] border-gray-300 rounded focus:ring-[#063b31] accent-[#063b31]" 
                    />
                    <label htmlFor="stay-signed-in" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider select-none cursor-pointer">
                      Stay Signed In
                    </label>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-14 h-14 bg-[#063b31] hover:bg-[#042c25] active:scale-95 text-white rounded-2xl shadow-lg flex items-center justify-center transition-all cursor-pointer"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063b31] focus:border-transparent transition text-sm font-medium text-gray-700 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063b31] focus:border-transparent transition text-sm font-medium text-gray-700 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="09171234567"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063b31] focus:border-transparent transition text-sm font-medium text-gray-700 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#063b31] focus:border-transparent transition text-sm font-medium text-gray-700 bg-white"
                />
              </div>

              <div className="flex justify-center pt-2">
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="w-14 h-14 bg-[#063b31] hover:bg-[#042c25] active:scale-95 text-white rounded-2xl shadow-lg flex items-center justify-center transition-all cursor-pointer"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer / Protection */}
        <div className="text-center space-y-4">
          {!verificationMode && activeTab !== 'register' && (
            <Link 
              to="/forgot-password" 
              className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wider transition"
            >
              Forgot Password?
            </Link>
          )}
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            v98.0.3
          </p>
          
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-relaxed max-w-xs mx-auto">
            This site is protected by hCaptcha and its{" "}
            <a href="#" className="underline hover:text-gray-600">Privacy Policy</a> and{" "}
            <a href="#" className="underline hover:text-gray-600">Terms of Service</a> apply.
          </div>
        </div>
      </div>

      {/* Right Panel: Split Screen Background Image & Branding */}
      <div 
        className="hidden md:flex md:w-[55%] lg:w-[60%] relative bg-cover bg-center h-screen items-center justify-center"
        style={{ 
          backgroundImage: "linear-gradient(rgba(5, 54, 48, 0.45), rgba(5, 54, 48, 0.55)), url('/images/backgroundImage.jpg')" 
        }}
      >
        {/* Top Right User Icon Button */}
        <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-md hover:bg-white/20 transition cursor-pointer">
          <User className="w-5 h-5" />
        </button>

        {/* Center Logo branding inside circles */}
        <div className="flex flex-col items-center gap-6 text-center select-none z-10">
          <div className="w-56 h-56 rounded-full border-2 border-dashed border-teal-300/20 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full border border-white/10 bg-white/5 backdrop-blur-xs flex items-center justify-center shadow-2xl">
              {/* Slanted smart parking icon */}
              <svg className="w-16 h-16 text-teal-300/80 transform -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
              </svg>
            </div>
          </div>
          <p className="text-[10px] font-black tracking-[0.3em] text-white/95 uppercase mt-2">
            Transforming Urban Mobility
          </p>
        </div>

        {/* Bottom Right Video Icon Button */}
        <button className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-black/30 border border-white/10 flex items-center justify-center text-white backdrop-blur-md hover:bg-black/40 transition cursor-pointer">
          {/* Custom video camera icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AccountPage;
