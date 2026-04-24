import { useState, useEffect } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import reportService from '../../services/reportService.js';
import lotService from '../../services/lotService.js';
import SelectField from '../../components/forms/SelectField.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

const SensorLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (selectedLot) params.lotId = selectedLot;
      const data = await reportService.getSensorLogs(params);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    lotService.getLots().then(setLots);
    fetchLogs();
  }, []);

  const anomalies = logs.filter((log) => log.isAnomaly);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sensor Logs</h1>
        <button onClick={fetchLogs} className="btn-secondary text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="card flex flex-wrap gap-4">
        <SelectField
          value={selectedLot}
          onChange={(e) => setSelectedLot(e.target.value)}
          options={[{ value: '', label: 'All Lots' }, ...lots.map((l) => ({ value: l._id, label: l.name }))]}
          className="w-64"
        />
        <button onClick={fetchLogs} className="btn-primary text-sm">Filter</button>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Sensor ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Lot</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Slot</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Distance (cm)</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Timestamp</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Anomaly</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className={`border-b border-gray-50 hover:bg-gray-50 ${log.isAnomaly ? 'bg-red-50' : ''}`}>
                  <td className="py-3 px-4 font-mono text-xs">{log.sensorId}</td>
                  <td className="py-3 px-4">{log.lotId?.name}</td>
                  <td className="py-3 px-4">{log.slotId?.slotNumber}</td>
                  <td className="py-3 px-4 capitalize">{log.status}</td>
                  <td className="py-3 px-4">{log.distanceCm}</td>
                  <td className="py-3 px-4">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    {log.isAnomaly ? (
                      <span className="flex items-center gap-1 text-red-600 text-xs font-bold">
                        <AlertTriangle className="w-3 h-3" /> Yes
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">No</span>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan="7" className="py-8 text-center text-gray-400">No logs found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {anomalies.length > 0 && (
        <div className="card border-red-200 bg-red-50">
          <h3 className="font-bold text-red-700 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5" /> Anomaly Alerts ({anomalies.length})
          </h3>
          <div className="space-y-2 text-sm">
            {anomalies.map((a) => (
              <div key={a._id} className="p-3 bg-white rounded-lg border border-red-100">
                <p><strong>{a.sensorId}</strong> at {a.lotId?.name} / {a.slotId?.slotNumber}</p>
                <p className="text-gray-500">Distance: {a.distanceCm}cm at {new Date(a.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SensorLogsPage;

