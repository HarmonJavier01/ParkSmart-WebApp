import { useState } from 'react';
import { User, Activity, Info } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import useSocket from '../../hooks/useSocket.js';

const SettingsPage = () => {
  const { user } = useAuth();
  const { connected: socketConnected } = useSocket();

  const adminName = user?.name || 'Super Admin';
  const adminEmail = user?.email || 'admin@parksmart.ph';
  const adminRole = (user?.role || 'superadmin').toUpperCase();

  return (
    <div className="max-w-4xl space-y-6 font-outfit">
      <h1 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Admin Profile Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/80 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight">Admin Profile</h2>
          </div>

          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-sm font-semibold text-gray-400">Name</span>
              <span className="text-sm font-black text-gray-900">{adminName}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-sm font-semibold text-gray-400">Email</span>
              <span className="text-sm font-bold text-gray-900">{adminEmail}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-semibold text-gray-400">Role</span>
              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 tracking-wider">
                {adminRole}
              </span>
            </div>
          </div>
        </div>

        {/* 2. System Status Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/80 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight">System Status</h2>
          </div>

          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-sm font-semibold text-gray-400">Backend API</span>
              <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Online</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-sm font-semibold text-gray-400">Socket.IO</span>
              <div className="flex items-center gap-1.5 font-bold text-sm">
                <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                <span className={socketConnected ? 'text-emerald-600' : 'text-rose-500'}>
                  {socketConnected ? 'Online' : 'Connecting...'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-semibold text-gray-400">Google Maps</span>
              <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. About Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/80 space-y-5 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight">About</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="flex items-center justify-between p-3.5 bg-gray-50/70 rounded-2xl">
              <span className="text-sm font-semibold text-gray-400">App</span>
              <span className="text-sm font-black text-gray-900">ParkSmart Web</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-gray-50/70 rounded-2xl">
              <span className="text-sm font-semibold text-gray-400">Version</span>
              <span className="text-sm font-black text-gray-900">1.0.0</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-gray-50/70 rounded-2xl">
              <span className="text-sm font-semibold text-gray-400">Platform</span>
              <span className="text-sm font-bold text-gray-900">Web (React + Vite)</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-gray-50/70 rounded-2xl">
              <span className="text-sm font-semibold text-gray-400">Location</span>
              <span className="text-sm font-black text-gray-900">Manaoag, Pangasinan</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
