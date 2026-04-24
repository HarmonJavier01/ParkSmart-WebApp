import { useState, useEffect } from 'react';
import lotService from '../../services/lotService.js';
import slotService from '../../services/slotService.js';
import SlotGrid from '../../components/parking/SlotGrid.jsx';
import { useSocketEvent } from '../../hooks/useSocket.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

const MonitorPage = () => {
  const [lots, setLots] = useState([]);
  const [slotsMap, setSlotsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lotsData = await lotService.getLots();
        setLots(lotsData);

        const slotsData = {};
        for (const lot of lotsData) {
          const slots = await slotService.getSlotsByLot(lot._id);
          slotsData[lot._id] = slots;
        }
        setSlotsMap(slotsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useSocketEvent('slot:update', (updatedSlot) => {
    setSlotsMap((prev) => {
      const lotSlots = prev[updatedSlot.lotId];
      if (!lotSlots) return prev;
      return {
        ...prev,
        [updatedSlot.lotId]: lotSlots.map((s) =>
          s._id === updatedSlot.slotId ? { ...s, status: updatedSlot.status } : s
        )
      };
    });
  });

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Real-Time Monitor</h1>

      {lots.map((lot) => (
        <div key={lot._id} className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">{lot.name}</h3>
              <p className="text-sm text-gray-500">{lot.address}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {(slotsMap[lot._id] || []).filter((s) => s.status === 'available').length} Available
              </span>
              <span className="flex items-center gap-1 text-red-600">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {(slotsMap[lot._id] || []).filter((s) => s.status === 'occupied').length} Occupied
              </span>
              <span className="flex items-center gap-1 text-yellow-600">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                {(slotsMap[lot._id] || []).filter((s) => s.status === 'reserved').length} Reserved
              </span>
            </div>
          </div>
          <SlotGrid slots={slotsMap[lot._id] || []} />
        </div>
      ))}
    </div>
  );
};

export default MonitorPage;

