import { MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-4">ParkSmart</h3>
          <p className="text-sm">Smart parking solution for Manaoag, Pangasinan. Find and reserve parking spaces in real-time.</p>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Contact</h3>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Manaoag, Pangasinan, Philippines</p>
            <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> (075) 123-4567</p>
            <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@parksmart.ph</p>
          </div>
        </div>
        <div>
          <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
          <div className="space-y-2 text-sm">
            <a href="/parking" className="block hover:text-white transition">Find Parking</a>
            <a href="/account" className="block hover:text-white transition">My Account</a>
            <a href="/admin" className="block hover:text-white transition">Admin Dashboard</a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-xs">
        &copy; {new Date().getFullYear()} ParkSmart Manaoag. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

