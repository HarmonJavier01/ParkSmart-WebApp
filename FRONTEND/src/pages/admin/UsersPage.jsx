import { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import userService from '../../services/userService.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>

      <div className="card overflow-x-auto">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Reservations</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Joined</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{user.name}</td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">{user.phone}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">{user.totalReservations || 0}</td>
                  <td className="py-3 px-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleStatus(user._id, user.isActive)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {user.isActive ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan="8" className="py-8 text-center text-gray-400">No users found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UsersPage;

