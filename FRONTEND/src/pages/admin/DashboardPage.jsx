import { useState, useEffect } from 'react';
import { Car, MapPin, CalendarCheck, Banknote, Activity } from 'lucide-react';
import KPICard from '../../components/dashboard/KPICard.jsx';
import OccupancyChart from '../../components/dashboard/OccupancyChart.jsx';
import StatusDonut from '../../components/dashboard/StatusDonut.jsx';
import LiveFeed from '../../components/dashboard/LiveFeed.jsx';
import SensorHealthRow from '../../components/dashboard/SensorHealthRow.jsx';
import reportService from '../../services/reportService.js';
import reservationService from '../../services/reservationService.js';
import lotService from '../../services/lotService.js';
import { useSocketEvent } from '../../hooks/useSocket.js';

const DashboardPage = () => {
  const [lots, setLots] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [sensorLogs, setSensorLogs] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lotsData, reservationsData, logsData] = await Promise.all([
          lotService.getLots(),
          reservationService.getAllReservations(),
          reportService.getSensorLogs({ limit: 20 })
        ]);
        setLots(lotsData);
        setReservations(reservationsData);
        setSensorLogs(logsData);

        // Mock occupancy data for last 24 hours
        const mockData = Array.from({ length: 24 }, (_, i) => ({
          hour: `${i}:00`,
          occupied: Math.floor(Math.random() * 10),
          available: Math.floor(Math.random() * 10) + 5
        }));
        setOccupancyData(mockData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useSocketEvent('reservation:new', (data) => {
    console.log('New reservation:', data);
  });

  const totalSlots = lots.reduce((acc, lot) => acc + lot.totalSlots, 0);
  const availableSlots = lots.reduce((acc, lot) => acc + (lot.availableSlots || 0), 0);
  const occupiedSlots = totalSlots - availableSlots;
  const todayReservations = reservations.filter((r) => {
    const date = new Date(r.createdAt);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  });
  const todayRevenue = todayReservations.reduce((acc, r) => acc + (r.fee || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Slots" value={totalSlots} icon={MapPin} color="blue" />
        <KPICard title="Occupied Now" value={occupiedSlots} icon={Car} color="red" />
        <KPICard title="Available Now" value={availableSlots} icon={Activity} color="green" />
        <KPICard title="Today's Reservations" value={todayReservations.length} icon={CalendarCheck} color="amber" />
        <KPICard title="Revenue Today" value={`₱${todayRevenue}`} icon={Banknote} color="teal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OccupancyChart data={occupancyData} />
        <StatusDonut available={availableSlots} occupied={occupiedSlots} reserved={reservations.filter(r => r.status === 'confirmed').length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveFeed reservations={reservations} />
        <SensorHealthRow sensors={sensorLogs} />
      </div>
    </div>
  );
};

export default DashboardPage;

