import { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import HeatmapChart from '../../components/dashboard/HeatmapChart.jsx';
import reportService from '../../services/reportService.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [dailyData, setDailyData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateRange.from) params.dateFrom = dateRange.from;
      if (dateRange.to) params.dateTo = dateRange.to;

      const [daily, heatmap, revenue] = await Promise.all([
        reportService.getDaily(params),
        reportService.getHourlyHeatmap(params),
        reportService.getRevenue(params)
      ]);

      setDailyData(daily.map((d) => ({ date: d._id, count: d.count, revenue: d.revenue })));
      setHeatmapData(heatmap);
      setRevenueData(revenue.map((r) => ({ name: r.lotName, revenue: r.totalRevenue, count: r.count })));

      // Mock occupancy by lot
      setOccupancyData(revenue.map((r) => ({ name: r.lotName, rate: Math.round((r.count / 20) * 100) })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const tabs = [
    { key: 'daily', label: 'Daily Trends' },
    { key: 'heatmap', label: 'Peak Hours' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'occupancy', label: 'Occupancy Rate' }
  ];

  const handleExportCSV = () => {
    let data = [];
    if (activeTab === 'daily') data = dailyData;
    else if (activeTab === 'revenue') data = revenueData;
    else if (activeTab === 'occupancy') data = occupancyData;

    const csv = [Object.keys(data[0] || {}).join(','), ...data.map((row) => Object.values(row).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-report.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="btn-secondary text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="card flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button onClick={fetchData} className="btn-primary text-sm">Generate</button>
      </div>

      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium transition ${
              activeTab === tab.key ? 'text-parking-primary border-b-2 border-parking-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="card h-96">
          {activeTab === 'daily' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#0f766e" name="Reservations" />
                <Line type="monotone" dataKey="revenue" stroke="#f59e0b" name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          )}
          {activeTab === 'heatmap' && <HeatmapChart data={heatmapData} />}
          {activeTab === 'revenue' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`₱${value}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#0f766e" />
              </BarChart>
            </ResponsiveContainer>
          )}
          {activeTab === 'occupancy' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis unit="%" />
                <Tooltip formatter={(value) => [`${value}%`, 'Occupancy']} />
                <Bar dataKey="rate" fill="#14b8a6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;

