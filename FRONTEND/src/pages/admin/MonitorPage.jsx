import { useState, useEffect } from 'react';
import lotService from '../../services/lotService.js';
import slotService from '../../services/slotService.js';
import SlotGrid from '../../components/parking/SlotGrid.jsx';
import ParkingMap from '../../components/parking/ParkingMap.jsx';
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
        <div key={lot._id} className="card space-y-6">
          <div className="flex items-center justify-between mb-2">
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

          {/* Slot Grid Status */}
          <SlotGrid slots={slotsMap[lot._id] || []} />

          {/* Live Geospatial Parking Map */}
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm mt-6">
            <div className="p-4 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-gray-800">Live Satellite Parking Map</h4>
                <p className="text-xs text-gray-500">Real-time geospatial layout and slot markers for {lot.name}</p>
              </div>
            </div>
            <div className="h-[460px] w-full">
              <ParkingMap
                lots={[lot]}
                slots={slotsMap[lot._id] || []}
                center={{ lat: lot.lat || 16.0450924, lng: lot.lng || 120.4909147 }}
                zoom={19}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MonitorPage;

