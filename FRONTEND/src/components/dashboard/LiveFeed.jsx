import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge.jsx';

const LiveFeed = ({ reservations = [] }) => {
  return (
    <div className="card">
      <h3 className="font-bold text-lg mb-4">Live Reservations</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 px-2 font-medium text-gray-500">ID</th>
              <th className="text-left py-2 px-2 font-medium text-gray-500">User</th>
              <th className="text-left py-2 px-2 font-medium text-gray-500">Lot</th>
              <th className="text-left py-2 px-2 font-medium text-gray-500">Slot</th>
              <th className="text-left py-2 px-2 font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {reservations.slice(0, 10).map((r) => (
              <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-2 px-2 font-mono text-xs">{r._id?.slice(-6)}</td>
                <td className="py-2 px-2">{r.userId?.name || r.guestInfo?.name || 'Guest'}</td>
                <td className="py-2 px-2">{r.lotId?.name}</td>
                <td className="py-2 px-2">{r.slotId?.slotNumber}</td>
                <td className="py-2 px-2">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
            {reservations.length === 0 && (
              <tr>
                <td colSpan="5" className="py-4 text-center text-gray-400">No recent reservations</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LiveFeed;

