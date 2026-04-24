import { useState } from 'react';
import { Save, Mail, Bell, UserCog } from 'lucide-react';
import InputField from '../../components/forms/InputField.jsx';
import SelectField from '../../components/forms/SelectField.jsx';

const SettingsPage = () => {
  const [rates, setRates] = useState({ lot1: 20, lot2: 15 });
  const [notifications, setNotifications] = useState({ email: true, sms: false });
  const [smtp, setSmtp] = useState({ host: '', port: '', user: '', pass: '' });
  const [admins, setAdmins] = useState([
    { _id: '1', name: 'Super Admin', email: 'admin@parksmart.ph', role: 'superadmin' },
    { _id: '2', name: 'Lot Operator', email: 'operator@parksmart.ph', role: 'lot_operator' }
  ]);

  const handleSaveRates = () => {
    alert('Rates saved (demo)');
  };

  const handleSaveSMTP = () => {
    alert('SMTP config saved (demo)');
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Parking Rates */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <UserCog className="w-5 h-5 text-parking-primary" />
          <h2 className="text-lg font-bold">Parking Rates</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
          <InputField
            label="Manaoag Church Lot (per hour)"
            type="number"
            value={rates.lot1}
            onChange={(e) => setRates({ ...rates, lot1: e.target.value })}
          />
          <InputField
            label="Public Market Lot (per hour)"
            type="number"
            value={rates.lot2}
            onChange={(e) => setRates({ ...rates, lot2: e.target.value })}
          />
        </div>
        <button onClick={handleSaveRates} className="mt-4 btn-primary text-sm flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Rates
        </button>
      </div>

      {/* Notifications */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-parking-primary" />
          <h2 className="text-lg font-bold">Notifications</h2>
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
              className="w-4 h-4 text-teal-600 rounded"
            />
            <span className="text-sm">Email notifications for new reservations</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications.sms}
              onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
              className="w-4 h-4 text-teal-600 rounded"
            />
            <span className="text-sm">SMS alerts for sensor anomalies</span>
          </label>
        </div>
      </div>

      {/* SMTP Config */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-parking-primary" />
          <h2 className="text-lg font-bold">SMTP Configuration</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <InputField label="SMTP Host" value={smtp.host} onChange={(e) => setSmtp({ ...smtp, host: e.target.value })} />
          <InputField label="SMTP Port" type="number" value={smtp.port} onChange={(e) => setSmtp({ ...smtp, port: e.target.value })} />
          <InputField label="Username" value={smtp.user} onChange={(e) => setSmtp({ ...smtp, user: e.target.value })} />
          <InputField label="Password" type="password" value={smtp.pass} onChange={(e) => setSmtp({ ...smtp, pass: e.target.value })} />
        </div>
        <button onClick={handleSaveSMTP} className="mt-4 btn-primary text-sm flex items-center gap-2">
          <Save className="w-4 h-4" /> Save SMTP
        </button>
      </div>

      {/* Admin Accounts */}
      <div className="card">
        <h2 className="text-lg font-bold mb-4">Admin Accounts</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Role</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin._id} className="border-b border-gray-50">
                  <td className="py-3 px-4">{admin.name}</td>
                  <td className="py-3 px-4 text-gray-600">{admin.email}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-teal-100 text-teal-700 capitalize">
                      {admin.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

