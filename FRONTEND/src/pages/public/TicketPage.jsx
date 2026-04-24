import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Printer, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import QRTicket from '../../components/reservation/QRTicket.jsx';
import reservationService from '../../services/reservationService.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

const TicketPage = () => {
  const { reservationId } = useParams();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const data = await reservationService.getReservation(reservationId);
        setReservation(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReservation();
  }, [reservationId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!reservation) return <div className="text-center py-20">Reservation not found</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="no-print flex items-center justify-between mb-6">
        <Link to="/account" className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> My Account
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 btn-secondary text-sm"
        >
          <Printer className="w-4 h-4" />
          Print Ticket
        </button>
      </div>

      <QRTicket reservation={reservation} />

      <div className="no-print mt-6 text-center">
        <p className="text-sm text-gray-500">
          Save this ticket or print it to show at the parking entrance.
        </p>
      </div>
    </div>
  );
};

export default TicketPage;

