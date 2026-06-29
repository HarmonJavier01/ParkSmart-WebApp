import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  User, 
  LogIn, 
  UserPlus, 
  Save, 
  KeyRound, 
  ArrowLeft, 
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
    <div className="min-h-[85vh] relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-outfit">
      {/* Aesthetic Floating Blur Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl border border-gray-100/50 shadow-2xl rounded-2xl p-8 z-10 animate-fade-in">
        
        {/* Splendid Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 bg-gradient-to-tr from-parking-primary to-parking-secondary rounded-2xl items-center justify-center shadow-lg shadow-parking-primary/20 mb-4 animate-bounce">
            <Car className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">ParkSmart</h2>
          <p className="text-sm text-gray-500 mt-1">Smart IoT Parking Platform</p>
        </div>

        {!verificationMode && (
          /* Premium Sliding Pill Tab Selector */
          <div className="bg-gray-100/80 p-1.5 rounded-2xl flex mb-8 relative">
            <div 
              className={`absolute top-1.5 bottom-1.5 rounded-xl bg-white shadow-md transition-all duration-300 ease-out ${
                activeTab === 'login' 
                  ? 'left-1.5 w-[calc(50%-3px)]' 
                  : 'left-[calc(50%+1.5px)] w-[calc(50%-3px)]'
              }`}
            />
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex-grow py-3 text-sm font-bold text-center z-10 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
                activeTab === 'login' ? 'text-parking-primary scale-100' : 'text-gray-400 hover:text-gray-600 scale-95'
              }`}
            >
              <LogIn className="w-4 h-4" /> Login
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-grow py-3 text-sm font-bold text-center z-10 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
                activeTab === 'register' ? 'text-parking-primary scale-100' : 'text-gray-400 hover:text-gray-600 scale-95'
              }`}
            >
              <UserPlus className="w-4 h-4" /> Register
            </button>
          </div>
        )}

        {verificationMode ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-parking-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-parking-primary animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Verify Your Account</h3>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                We've sent a 6-digit code to <span className="font-semibold text-gray-800">{registeredEmail}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <InputField
                label="6-Digit OTP"
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
                placeholder="000000"
                className="text-center text-2xl tracking-[0.5em] font-mono"
              />
              
              <button 
                type="submit" 
                disabled={submitting} 
                className="w-full btn-primary py-3.5 rounded-xl shadow-lg shadow-parking-primary/20 hover:shadow-xl font-bold text-white transition-all transform active:scale-95"
              >
                {submitting ? 'Verifying...' : 'Verify & Login'}
              </button>
            </form>

            <div className="flex flex-col gap-3 pt-2">
              <button 
                onClick={handleResendOTP}
                disabled={submitting}
                className="text-sm text-parking-primary font-bold hover:underline text-center transition"
              >
                Didn't get the code? Resend
              </button>
              <button 
                onClick={() => setVerificationMode(false)}
                className="text-sm text-gray-400 flex items-center justify-center gap-2 hover:text-gray-600 transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Registration
              </button>
            </div>
          </div>
        ) : activeTab === 'login' ? (
          <div className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <InputField
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
              />
              <div>
                <InputField
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
                <div className="flex justify-end mt-2">
                  <Link 
                    to="/forgot-password" 
                    className="text-xs font-semibold text-parking-primary hover:underline transition"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={submitting} 
                className="w-full py-3.5 bg-gradient-to-r from-parking-primary to-parking-secondary hover:brightness-110 active:scale-95 text-white font-bold rounded-xl shadow-lg shadow-parking-primary/10 hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Social Logins Splitter */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold uppercase tracking-wider">or continue with</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button" 
                onClick={() => alert('Google authentication demo')}
                className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition text-sm font-semibold text-gray-700 bg-white shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.115-5.187 4.115-3.4 0-6.159-2.759-6.159-6.16s2.759-6.16 6.16-6.16c1.654 0 3.12.656 4.22 1.722l3.056-3.056C19.299 1.77 15.992 0 12.24 0c-6.62 0-12 5.38-12 12s5.38 12 12 12c5.56 0 10.22-3.82 11.45-9.01H12.24z"/>
                </svg>
                Google
              </button>
              <button 
                type="button" 
                onClick={() => alert('Apple ID authentication demo')}
                className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition text-sm font-semibold text-gray-700 bg-white shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.62.71-1.16 1.85-1.01 2.96 1.12.09 2.27-.6 2.96-1.41z"/>
                </svg>
                Apple
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <InputField
              label="Full Name"
              placeholder="John Doe"
              value={registerData.name}
              onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
              required
            />
            <InputField
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              required
            />
            <InputField
              label="Phone Number"
              placeholder="09171234567"
              value={registerData.phone}
              onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
              required
            />
            <InputField
              label="Password"
              type="password"
              placeholder="••••••••"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              required
            />
            <button 
              type="submit" 
              disabled={submitting} 
              className="w-full py-3.5 bg-gradient-to-r from-parking-primary to-parking-secondary hover:brightness-110 active:scale-95 text-white font-bold rounded-xl shadow-lg shadow-parking-primary/10 hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-6"
            >
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
