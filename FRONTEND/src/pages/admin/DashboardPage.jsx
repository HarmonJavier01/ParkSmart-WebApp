import { useState, useEffect } from 'react';
import { Car, MapPin, CalendarCheck, Banknote, Activity } from 'lucide-react';
import KPICard from '../../components/dashboard/KPICard.jsx';
import OccupancyChart from '../../components/dashboard/OccupancyChart.jsx';
import StatusDonut from '../../components/dashboard/StatusDonut.jsx';
import LiveFeed from '../../components/dashboard/LiveFeed.jsx';
import SensorHealthRow from '../../components/dashboard/SensorHealthRow.jsx';
import ESP32StatusPanel from '../../components/dashboard/ESP32StatusPanel.jsx';
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
        // TODO: Reservations must be removed. reservationService fetching removed.
        const [lotsData, logsData] = await Promise.all([
          lotService.getLots(),
          reportService.getSensorLogs({ limit: 20 })
        ]);
        setLots(lotsData);
        setReservations([]);
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

  // TODO: Reservations must be removed. Socket listener commented out.
  /*
  useSocketEvent('reservation:new', (data) => {
    console.log('New reservation:', data);
  });
  */

  const totalSlots = lots.reduce((acc, lot) => acc + lot.totalSlots, 0);
  const availableSlots = lots.reduce((acc, lot) => acc + (lot.availableSlots || 0), 0);
  const occupiedSlots = totalSlots - availableSlots;
  const todayReservations = [];
  const todayRevenue = 0;

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard title="Total Slots" value={totalSlots} icon={MapPin} color="blue" />
        <KPICard title="Occupied Now" value={occupiedSlots} icon={Car} color="red" />
        <KPICard title="Available Now" value={availableSlots} icon={Activity} color="green" />
        {/* TODO: Reservations must be removed. KPI cards commented out. */}
        {/* <KPICard title="Today's Reservations" value={todayReservations.length} icon={CalendarCheck} color="amber" /> */}
        {/* <KPICard title="Revenue Today" value={`₱${todayRevenue}`} icon={Banknote} color="teal" /> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OccupancyChart data={occupancyData} />
        <StatusDonut available={availableSlots} occupied={occupiedSlots} reserved={0} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* TODO: Reservations must be removed. LiveFeed commented out. */}
        {/* <LiveFeed reservations={reservations} /> */}
        <SensorHealthRow sensors={sensorLogs} />
      </div>

      {/* ESP32 Live Data commented out */}
      {/* <ESP32StatusPanel /> */}
    </div>
  );
};

export default DashboardPage;

