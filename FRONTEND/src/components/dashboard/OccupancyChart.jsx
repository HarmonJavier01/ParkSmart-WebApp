import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const OccupancyChart = ({ data }) => {
  const chartData = {
    labels: data.map((d) => d.hour),
    datasets: [
      {
        label: 'Occupied Slots',
        data: data.map((d) => d.occupied),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Available Slots',
        data: data.map((d) => d.available),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Last 24 Hours Occupancy' }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div className="card h-80">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default OccupancyChart;

