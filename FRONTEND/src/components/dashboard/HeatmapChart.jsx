import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const HeatmapChart = ({ data }) => {
  const getColor = (value) => {
    if (value === 0) return '#e5e7eb';
    if (value < 3) return '#fde68a';
    if (value < 6) return '#fbbf24';
    if (value < 10) return '#f59e0b';
    return '#d97706';
  };

  return (
    <div className="card h-80">
      <h3 className="font-bold text-lg mb-4">Peak Hours Heatmap</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
          <YAxis />
          <Tooltip formatter={(value) => [`${value} reservations`, 'Count']} />
          <Bar dataKey="count">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.count)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HeatmapChart;

