import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Banknote, ArrowLeft } from 'lucide-react';
import SlotGrid from '../../components/parking/SlotGrid.jsx';
import useSlots from '../../hooks/useSlots.js';
import lotService from '../../services/lotService.js';
import { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

const LotDetailPage = () => {
  const { lotId } = useParams();
  const navigate = useNavigate();
  const [lot, setLot] = useState(null);
  const { slots, loading: slotsLoading } = useSlots(lotId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLot = async () => {
      try {
        const data = await lotService.getLotById(lotId);
        setLot(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLot();
  }, [lotId]);

  const handleSlotClick = (slot) => {
    if (slot.status === 'available') {
      navigate(`/reserve/${slot._id}?lotId=${lotId}`);
    }
  };

  if (loading || slotsLoading) return <LoadingSpinner fullScreen />;
  if (!lot) return <div className="text-center py-20">Lot not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/parking')}
        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to search
      </button>

      <div className="card mb-6">
        <h1 className="text-2xl font-bold mb-2">{lot.name}</h1>
        <p className="text-gray-500 flex items-center gap-1 mb-3">
          <MapPin className="w-4 h-4" /> {lot.address}
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1 text-gray-600">
            <Clock className="w-4 h-4" />
            {lot.operatingHours?.open} - {lot.operatingHours?.close}
          </span>
          <span className="flex items-center gap-1 text-gray-600">
            <Banknote className="w-4 h-4" />
            ₱{lot.ratePerHour}/hour
          </span>
        </div>
      </div>

      <SlotGrid
        slots={slots}
        onSlotClick={handleSlotClick}
        title={`Slots (${lot.availableSlots || 0} available)`}
      />

      <p className="text-sm text-gray-500 mt-4 text-center">
        Click on a green (available) slot to reserve it.
      </p>
    </div>
  );
};

export default LotDetailPage;

