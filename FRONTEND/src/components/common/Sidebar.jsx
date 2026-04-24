import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Monitor,
  CalendarCheck,
  Users,
  BarChart3,
  Activity,
  Settings,
  LogOut
} from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/lots', label: 'Lots', icon: MapPin },
  { path: '/admin/monitor', label: 'Monitor', icon: Monitor },
  { path: '/admin/reservations', label: 'Reservations', icon: CalendarCheck },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { path: '/admin/sensors', label: 'Sensors', icon: Activity },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">ParkSmart Admin</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive ? 'bg-teal-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

