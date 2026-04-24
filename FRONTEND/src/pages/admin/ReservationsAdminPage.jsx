import { useState, useEffect } from 'react';
import { Download, Eye, XCircle, CheckCircle } from 'lucide-react';
import reservationService from '../../services/reservationService.js';
import lotService from '../../services/lotService.js';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import SelectField from '../../components/forms/SelectField.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

const ReservationsAdminPage = () => {
  const [reservations, setReservations] = useState([]);
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ lot: '', status: '', dateFrom: '', dateTo: '' });
  const [viewing, setViewing] = useState(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.lot) params.lot = filters.lot;
      if (filters.status) params.status = filters.status;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;

      const data = await reservationService.getAllReservations(params);
      setReservations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    lotService.getLots().then(setLots);
  }, []);

  const handleExport = () => {
    const csvContent = [
      ['ID', 'User', 'Lot', 'Slot', 'Start', 'End', 'Duration', 'Fee', 'Status'].join(','),
      ...reservations.map((r) => [
        r._id,
        r.userId?.name || r.guestInfo?.name || 'Guest',
        r.lotId?.name,
        r.slotId?.slotNumber,
        new Date(r.startTime).toLocaleString(),
        new Date(r.endTime).toLocaleString(),
        r.duration,
        r.fee,
        r.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reservations.csv';
    a.click();
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this reservation?')) return;
    try {
      await reservationService.cancelReservation(id);
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancel failed');
    }
  };

  const handleComplete = async (id) => {
    if (!confirm('Mark this reservation as completed?')) return;
    try {
      await reservationService.completeReservation(id);
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Complete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reservations</h1>
        <button onClick={handleExport} className="btn-secondary flex items-center gap-2 text-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="card flex flex-wrap gap-4">
        <SelectField
          value={filters.lot}
          onChange={(e) => setFilters({ ...filters, lot: e.target.value })}
          options={[{ value: '', label: 'All Lots' }, ...lots.map((l) => ({ value: l._id, label: l.name }))]}
          className="w-48"
        />
        <SelectField
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'occupied', label: 'Occupied' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' }
          ]}
          className="w-40"
        />
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <button onClick={fetchReservations} className="btn-primary text-sm">Filter</button>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">User</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Lot</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Slot</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Start</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Duration</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Fee</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-xs">{r._id?.slice(-6)}</td>
                  <td className="py-3 px-4">{r.userId?.name || r.guestInfo?.name || 'Guest'}</td>
                  <td className="py-3 px-4">{r.lotId?.name}</td>
                  <td className="py-3 px-4">{r.slotId?.slotNumber}</td>
                  <td className="py-3 px-4">{new Date(r.startTime).toLocaleString()}</td>
                  <td className="py-3 px-4">{r.duration}h</td>
                  <td className="py-3 px-4">₱{r.fee}</td>
                  <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewing(r)} className="text-blue-600 hover:text-blue-700"><Eye className="w-4 h-4" /></button>
                      {['confirmed', 'occupied'].includes(r.status) && (
                        <button onClick={() => handleCancel(r._id)} className="text-red-600 hover:text-red-700"><XCircle className="w-4 h-4" /></button>
                      )}
                      {r.status === 'occupied' && (
                        <button onClick={() => handleComplete(r._id)} className="text-green-600 hover:text-green-700"><CheckCircle className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr><td colSpan="9" className="py-8 text-center text-gray-400">No reservations found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {viewing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Reservation Details</h3>
            <div className="space-y-2 text-sm">
              <p><strong>ID:</strong> {viewing._id}</p>
              <p><strong>User:</strong> {viewing.userId?.name || viewing.guestInfo?.name || 'Guest'}</p>
              <p><strong>Lot:</strong> {viewing.lotId?.name}</p>
              <p><strong>Slot:</strong> {viewing.slotId?.slotNumber}</p>
              <p><strong>Start:</strong> {new Date(viewing.startTime).toLocaleString()}</p>
              <p><strong>End:</strong> {new Date(viewing.endTime).toLocaleString()}</p>
              <p><strong>Fee:</strong> ₱{viewing.fee}</p>
              <p><strong>Status:</strong> <StatusBadge status={viewing.status} /></p>
            </div>
            <button onClick={() => setViewing(null)} className="mt-6 w-full btn-primary">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsAdminPage;

