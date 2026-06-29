import { Link, useNavigate } from 'react-router-dom';
import { Car, User, LogOut, Menu, X, MapPin, LayoutDashboard, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import useAuth from '../../hooks/useAuth.js';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-parking-primary text-white shadow-md relative z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl hover:text-teal-200 transition">
            <Car className="w-6 h-6 text-teal-300" />
            <span className="font-extrabold tracking-tight">ParkSmart</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6 font-semibold">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/5 shadow-xs">
                <div className="w-6 h-6 rounded-full bg-teal-400/20 flex items-center justify-center text-teal-300 font-extrabold text-xs border border-teal-400/20">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-bold text-teal-100">{user?.name}</span>
              </div>
            ) : (
              <>
                <Link to="/parking" className="hover:text-teal-200 transition">Find Parking</Link>
                <Link to="/account" className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition px-4 py-2 rounded-xl text-white font-bold border border-white/10">
                  <User className="w-4 h-4" />
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Hamburger Icon */}
          <button 
            className="md:hidden p-2 rounded-xl hover:bg-teal-800 transition" 
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Slide-out Mobile Navigation Drawer Menu Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity duration-300 md:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Slide-out Mobile Navigation Drawer Menu */}
      <div 
        className={`fixed inset-y-0 right-0 w-80 max-w-full bg-gradient-to-b from-teal-900 to-teal-950 text-white z-50 p-6 shadow-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col justify-between ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-teal-800/60">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl" onClick={() => setMobileOpen(false)}>
              <Car className="w-6 h-6 text-teal-300" />
              <span className="font-extrabold tracking-tight">ParkSmart</span>
            </Link>
            <button 
              onClick={() => setMobileOpen(false)} 
              className="p-2 rounded-xl bg-teal-800/40 hover:bg-teal-800 text-teal-200 border border-teal-800/30 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card inside mobile drawer */}
          {isAuthenticated && user && (
            <div className="mt-6 p-4 rounded-2xl bg-teal-800/30 border border-teal-800/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-400/20 flex items-center justify-center text-teal-300 font-bold border border-teal-400/30 text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-sm truncate">{user.name}</h4>
                <span className="text-[10px] text-teal-300 font-extrabold tracking-wider uppercase bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20 mt-1 inline-block capitalize">
                  {user.role}
                </span>
              </div>
            </div>
          )}

          {/* Drawer Navigation Links */}
          <nav className="mt-8 space-y-3 font-semibold">
            <Link 
              to="/parking" 
              className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-teal-800/40 transition text-teal-100 hover:text-white group border border-transparent hover:border-teal-800/30"
              onClick={() => setMobileOpen(false)}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform" />
                <span>Find Parking</span>
              </div>
              <ChevronRight className="w-4 h-4 text-teal-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {isAuthenticated ? (
              <Link 
                to={user?.role === 'user' ? '/account' : '/admin'} 
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-teal-800/40 transition text-teal-100 hover:text-white group border border-transparent hover:border-teal-800/30"
                onClick={() => setMobileOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform" />
                  <span>Dashboard</span>
                </div>
                <ChevronRight className="w-4 h-4 text-teal-500 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <Link 
                to="/account" 
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-teal-800/40 transition text-teal-100 hover:text-white group border border-transparent hover:border-teal-800/30"
                onClick={() => setMobileOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform" />
                  <span>Login / Register</span>
                </div>
                <ChevronRight className="w-4 h-4 text-teal-500 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </nav>
        </div>

        {/* Drawer Footer Actions */}
        {isAuthenticated && (
          <div className="pt-6 border-t border-teal-800/40">
            <button 
              onClick={() => { handleLogout(); setMobileOpen(false); }} 
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 transition font-bold border border-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
