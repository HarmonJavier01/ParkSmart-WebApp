import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Tag } from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';

const ReservationCard = ({ reservation, onCancel }) => {
  const isActive = ['confirmed', 'occupied'].includes(reservation.status);

  return (
    <div className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <StatusBadge status={reservation.status} />
          <span className="text-xs text-gray-500">#{reservation._id?.slice(-6)}</span>
        </div>
        <h4 className="font-bold text-gray-900">
          {reservation.lotId?.name || 'Unknown Lot'}
        </h4>
        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            Slot {reservation.slotId?.slotNumber}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(reservation.startTime).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {new Date(reservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
            {new Date(reservation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" />
            ₱{reservation.fee}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to={`/ticket/${reservation._id}`}
          className="text-sm text-teal-600 hover:underline"
        >
          View Ticket
        </Link>
        {isActive && onCancel && (
          <button
            onClick={() => onCancel(reservation._id)}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default ReservationCard;

