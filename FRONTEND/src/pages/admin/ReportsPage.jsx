import { useState, useEffect } from 'react';
import { Download, RefreshCw, AlertTriangle, Cpu, Radio, ShieldAlert } from 'lucide-react';
import reportService from '../../services/reportService.js';
import lotService from '../../services/lotService.js';
import SelectField from '../../components/forms/SelectField.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

const ReportsPage = () => {
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
  const uniqueSensorsCount = new Set(logs.map(log => log.sensorId)).size;

  const handleExportCSV = () => {
    const dataToExport = logs.map(log => ({
      'Sensor ID': log.sensorId,
      'Parking Lot': log.lotId?.name || 'N/A',
      'Slot Number': log.slotId?.slotNumber || 'N/A',
      'Status': log.status,
      'Distance (cm)': log.distanceCm,
      'Timestamp': new Date(log.timestamp).toLocaleString(),
      'Anomaly': log.isAnomaly ? 'Yes' : 'No'
    }));

    if (dataToExport.length === 0) {
      alert("No data available to export");
      return;
    }

    const csvHeaders = Object.keys(dataToExport[0]).join(',');
    const csvRows = dataToExport.map(row => 
      Object.values(row).map(value => `"${value}"`).join(',')
    );
    const csvContent = [csvHeaders, ...csvRows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sensor-detections-report.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-sm text-gray-500">Real-time sensor logs, anomaly detections, and physical environment analytics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchLogs} 
            className="btn-secondary text-sm flex items-center gap-2 hover:bg-gray-100 transition duration-150"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button 
            onClick={handleExportCSV} 
            className="btn-primary text-sm flex items-center gap-2 hover:opacity-90 transition duration-150"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards / Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-5 flex items-center gap-4 bg-white shadow-sm border border-gray-100 rounded-xl">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Readings</p>
            <h3 className="text-2xl font-extrabold text-gray-800">{logs.length}</h3>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 bg-white shadow-sm border border-gray-100 rounded-xl">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Sensors</p>
            <h3 className="text-2xl font-extrabold text-gray-800">{uniqueSensorsCount}</h3>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 bg-white shadow-sm border border-gray-100 rounded-xl">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${anomalies.length > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Anomaly Warnings</p>
            <h3 className="text-2xl font-extrabold text-gray-800">{anomalies.length}</h3>
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <div className="card flex flex-wrap gap-4 items-end bg-white p-6 shadow-sm border border-gray-100 rounded-xl">
        <div className="w-full md:w-64">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Filter by Parking Lot</label>
          <SelectField
            value={selectedLot}
            onChange={(e) => setSelectedLot(e.target.value)}
            options={[{ value: '', label: 'All Parking Lots' }, ...lots.map((l) => ({ value: l._id, label: l.name }))]}
            className="w-full"
          />
        </div>
        <button 
          onClick={fetchLogs} 
          className="btn-primary text-sm px-6 py-2.5 h-[42px] transition duration-150"
        >
          Filter Logs
        </button>
      </div>

      {/* Sensor Logs Table */}
      <div className="card overflow-hidden bg-white shadow-sm border border-gray-100 rounded-xl">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800">Sensor Detection Log history</h2>
          <p className="text-xs text-gray-500 mt-1">Showing the latest 100 physical sensor status and detection reports.</p>
        </div>
        
        {loading ? (
          <div className="p-12"><LoadingSpinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 text-left font-semibold uppercase text-xs tracking-wider">
                  <th className="py-3.5 px-6">Sensor ID</th>
                  <th className="py-3.5 px-6">Parking Lot</th>
                  <th className="py-3.5 px-6">Slot Number</th>
                  <th className="py-3.5 px-6">Detected Status</th>
                  <th className="py-3.5 px-6">Distance (cm)</th>
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Anomaly Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr 
                    key={log._id} 
                    className={`hover:bg-gray-50 transition duration-150 ${log.isAnomaly ? 'bg-red-50/30' : ''}`}
                  >
                    <td className="py-4 px-6 font-mono text-xs font-semibold text-gray-700">{log.sensorId}</td>
                    <td className="py-4 px-6 text-gray-600">{log.lotId?.name || 'N/A'}</td>
                    <td className="py-4 px-6 font-medium text-gray-800">{log.slotId?.slotNumber || 'N/A'}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        log.status === 'occupied' 
                          ? 'bg-red-100 text-red-800' 
                          : log.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-gray-600">{log.distanceCm} cm</td>
                    <td className="py-4 px-6 text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-4 px-6">
                      {log.isAnomaly ? (
                        <span className="flex items-center gap-1.5 text-red-600 text-xs font-extrabold uppercase tracking-wide">
                          <AlertTriangle className="w-4 h-4" /> Yes
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">No</span>
                      )}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-400 font-medium">
                      No logs found for this filter combination.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Anomalies Details Section */}
      {anomalies.length > 0 && (
        <div className="card border border-red-200 bg-red-50/30 rounded-xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-red-100 bg-red-50">
            <h3 className="font-extrabold text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" /> Active Anomaly Alerts ({anomalies.length})
            </h3>
            <p className="text-xs text-red-600/80 mt-1">Please inspect these sensors to verify if they are malfunctioning or obstructed.</p>
          </div>
          <div className="p-5 space-y-3 max-h-80 overflow-y-auto">
            {anomalies.map((a) => (
              <div key={a._id} className="p-4 bg-white rounded-lg border border-red-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Sensor: <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{a.sensorId}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Location: <strong className="text-gray-700">{a.lotId?.name || 'N/A'}</strong> / Slot: <strong className="text-gray-700">{a.slotId?.slotNumber || 'N/A'}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-gray-600">Distance: {a.distanceCm} cm</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{new Date(a.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
