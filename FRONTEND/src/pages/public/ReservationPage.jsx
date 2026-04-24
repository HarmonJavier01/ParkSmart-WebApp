import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ReservationForm from '../../components/reservation/ReservationForm.jsx';
import slotService from '../../services/slotService.js';
import lotService from '../../services/lotService.js';
import reservationService from '../../services/reservationService.js';
import useAuth from '../../hooks/useAuth.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

const ReservationPage = () => {
  const { slotId } = useParams();
  const [searchParams] = useSearchParams();
  const lotId = searchParams.get('lotId');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [slot, setSlot] = useState(null);
  const [lot, setLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slotData, lotData] = await Promise.all([
          slotService.getSlotsByLot(lotId).then((slots) => slots.find((s) => s._id === slotId)),
          lotService.getLotById(lotId)
        ]);
        setSlot(slotData);
        setLot(lotData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slotId, lotId]);

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      const response = await reservationService.createReservation(payload);
      navigate(`/ticket/${response.reservation._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create reservation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!slot || !lot) return <div className="text-center py-20">Slot not found</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-2">Reserve Parking</h1>

      <div className="card mb-6 bg-teal-50 border-teal-100">
        <h3 className="font-bold text-gray-900">{lot.name}</h3>
        <p className="text-gray-600">Slot {slot.slotNumber} ({slot.type})</p>
        <p className="text-parking-primary font-bold mt-1">₱{lot.ratePerHour}/hour</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-bold mb-4">Reservation Details</h2>
        <ReservationForm
          slot={slot}
          lot={lot}
          user={user}
          onSubmit={handleSubmit}
          loading={submitting}
        />
      </div>
    </div>
  );
};

export default ReservationPage;

