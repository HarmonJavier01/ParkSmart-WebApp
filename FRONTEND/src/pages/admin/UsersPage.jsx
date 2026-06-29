import { useState, useEffect } from 'react';
import { 
  ToggleLeft, 
  ToggleRight, 
  User, 
  X, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Activity, 
  FileText,
  ChevronRight
} from 'lucide-react';
import userService from '../../services/userService.js';
import reservationService from '../../services/reservationService.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userReservations, setUserReservations] = useState([]);
  const [loadingRes, setLoadingRes] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await userService.updateUserStatus(id, !currentStatus);
      fetchUsers();
      
      // Update local state if the toggled user is currently open in the drawer
      if (selectedUser && selectedUser._id === id) {
        setSelectedUser(prev => ({ ...prev, isActive: !currentStatus }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    try {
      setLoadingRes(true);
      const resData = await reservationService.getUserReservations(user._id);
      setUserReservations(resData);
    } catch (err) {
      console.error('Failed to load user reservations', err);
      setUserReservations([]);
    } finally {
      setLoadingRes(false);
    }
  };

  return (
    <div className="space-y-6 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage system accounts and monitor registration details</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card overflow-x-auto border border-gray-100 shadow-sm rounded-2xl bg-white p-6">
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3.5 px-4 font-bold text-gray-400 uppercase tracking-wider text-xs">Name</th>
                <th className="text-left py-3.5 px-4 font-bold text-gray-400 uppercase tracking-wider text-xs">Email</th>
                <th className="text-left py-3.5 px-4 font-bold text-gray-400 uppercase tracking-wider text-xs">Phone</th>
                <th className="text-left py-3.5 px-4 font-bold text-gray-400 uppercase tracking-wider text-xs">Role</th>
                <th className="text-left py-3.5 px-4 font-bold text-gray-400 uppercase tracking-wider text-xs">Reservations</th>
                <th className="text-left py-3.5 px-4 font-bold text-gray-400 uppercase tracking-wider text-xs">Joined</th>
                <th className="text-left py-3.5 px-4 font-bold text-gray-400 uppercase tracking-wider text-xs">Status</th>
                <th className="text-left py-3.5 px-4 font-bold text-gray-400 uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr 
                  key={user._id} 
                  onClick={() => handleSelectUser(user)}
                  className="border-b border-gray-50 hover:bg-teal-500/5 cursor-pointer transition-colors"
                >
                  <td className="py-4 px-4 font-bold text-gray-700">{user.name}</td>
                  <td className="py-4 px-4 text-gray-500 font-medium">{user.email}</td>
                  <td className="py-4 px-4 text-gray-600 font-mono">{user.phone}</td>
                  <td className="py-4 px-4">
                    <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full ${
                      user.role === 'superadmin' ? 'bg-indigo-100 text-indigo-700' :
                      user.role === 'lot_operator' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-gray-700">{user.totalReservations || 0}</td>
                  <td className="py-4 px-4 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 px-4">
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(user._id, user.isActive);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-50 rounded-lg"
                      title={user.isActive ? 'Deactivate User' : 'Activate User'}
                    >
                      {user.isActive ? (
                        <ToggleRight className="w-6 h-6 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-300" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-400 font-medium">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Slide-out Backdrop Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity duration-300 ${
          selectedUser ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSelectedUser(null)}
      />

      {/* Slide-out Detail Drawer (Slide Menu) */}
      <div 
        className={`fixed inset-y-0 right-0 w-96 max-w-full bg-white shadow-2xl z-50 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out border-l border-gray-100 ${
          selectedUser ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedUser && (
          <div className="flex flex-col h-full overflow-hidden font-outfit">
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                  <User className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-gray-800 leading-tight truncate max-w-[200px]">{selectedUser.name}</h3>
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Account Details</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)} 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="flex-grow overflow-y-auto py-6 space-y-6 pr-1">
              {/* Profile Details Card */}
              <div className="bg-gray-50/70 rounded-2xl p-4 border border-gray-100 space-y-3.5">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 font-semibold truncate">{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 font-semibold font-mono">{selectedUser.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 font-medium">Registered {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Status and Role Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-gray-100 bg-white flex flex-col justify-between h-24 shadow-xs">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Access Role
                  </span>
                  <span className={`text-xs font-black tracking-wider uppercase px-2.5 py-1.5 rounded-lg self-start mt-2 border capitalize ${
                    selectedUser.role === 'superadmin' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' :
                    selectedUser.role === 'lot_operator' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-gray-50 border-gray-100 text-gray-600'
                  }`}>
                    {selectedUser.role}
                  </span>
                </div>
                <div className="p-4 rounded-2xl border border-gray-100 bg-white flex flex-col justify-between h-24 shadow-xs">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Status
                  </span>
                  <span className={`text-xs font-black px-2.5 py-1.5 rounded-lg self-start mt-2 border ${
                    selectedUser.isActive 
                      ? 'bg-green-50 border-green-100 text-green-700' 
                      : 'bg-red-50 border-red-100 text-red-700'
                  }`}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Reservations History Segment */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" /> Reservations ({userReservations.length})
                </h4>
                
                {loadingRes ? (
                  <div className="flex justify-center py-10">
                    <LoadingSpinner />
                  </div>
                ) : userReservations.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-xs text-gray-400 font-semibold">No reservations found for this account</p>
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto max-h-[250px] pr-1">
                    {userReservations.map((res) => (
                      <div key={res._id} className="p-3 bg-white border border-gray-100 rounded-xl shadow-xs flex items-center justify-between text-xs hover:border-teal-300 transition">
                        <div>
                          <div className="font-bold text-gray-700 flex items-center gap-1.5">
                            <span>Slot {res.slotId?.label || 'N/A'}</span>
                            <span className="text-[10px] text-gray-400 font-normal">| {res.slotId?.lotId?.name || 'N/A'}</span>
                          </div>
                          <div className="text-gray-400 mt-1">
                            {new Date(res.startTime).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                            res.status === 'completed' ? 'bg-green-100 text-green-700' :
                            res.status === 'active' ? 'bg-teal-100 text-teal-700' :
                            res.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {res.status}
                          </span>
                          <span className="font-bold text-gray-700">₱{res.totalFee}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Control Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
              <button 
                onClick={() => handleToggleStatus(selectedUser._id, selectedUser.isActive)}
                className={`flex-grow py-3.5 rounded-xl font-bold text-sm transition-all border ${
                  selectedUser.isActive 
                    ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                    : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'
                }`}
              >
                {selectedUser.isActive ? 'Deactivate Account' : 'Activate Account'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
