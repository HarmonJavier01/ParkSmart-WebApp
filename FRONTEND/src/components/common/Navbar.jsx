import { Link, useNavigate } from 'react-router-dom';
import { Car, User, LogOut, Menu, X } from 'lucide-react';
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
    <nav className="bg-parking-primary text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Car className="w-6 h-6" />
            ParkSmart
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/parking" className="hover:text-teal-200 transition">Find Parking</Link>
            <Link to="/account" className="hover:text-teal-200 transition">My Account</Link>
            {isAuthenticated && user?.role !== 'user' && (
              <Link to="/admin" className="hover:text-teal-200 transition">Admin</Link>
            )}
            {isAuthenticated ? (
              <button onClick={handleLogout} className="flex items-center gap-1 hover:text-teal-200 transition">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <Link to="/account" className="flex items-center gap-1 hover:text-teal-200 transition">
                <User className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-teal-800 px-4 pb-4 space-y-2">
          <Link to="/parking" className="block py-2 hover:text-teal-200" onClick={() => setMobileOpen(false)}>Find Parking</Link>
          <Link to="/account" className="block py-2 hover:text-teal-200" onClick={() => setMobileOpen(false)}>My Account</Link>
          {isAuthenticated && user?.role !== 'user' && (
            <Link to="/admin" className="block py-2 hover:text-teal-200" onClick={() => setMobileOpen(false)}>Admin</Link>
          )}
          {isAuthenticated ? (
            <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block py-2 hover:text-teal-200">Logout</button>
          ) : (
            <Link to="/account" className="block py-2 hover:text-teal-200" onClick={() => setMobileOpen(false)}>Login</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

