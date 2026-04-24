import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const StatusDonut = ({ available = 0, occupied = 0, reserved = 0 }) => {
  const data = {
    labels: ['Available', 'Occupied', 'Reserved'],
    datasets: [
      {
        data: [available, occupied, reserved],
        backgroundColor: ['#22c55e', '#ef4444', '#eab308'],
        borderWidth: 0
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  return (
    <div className="card h-80">
      <h3 className="font-bold text-lg mb-4 text-center">Slot Status</h3>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default StatusDonut;

