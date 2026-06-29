import { MapPin, Car, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const LotCard = ({ lot, onMouseEnter, onMouseLeave }) => {
  const available = lot.availableSlots || 0;
  const total = lot.totalSlots || 1;
  const percentage = Math.round((available / total) * 100);

  return (
    <div 
      className="card hover:shadow-md transition cursor-pointer"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-bold text-lg text-gray-900">{lot.name}</h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${percentage > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {available > 0 ? `${available} available` : 'Full'}
        </span>
      </div>

      {/* Star rating preview */}
      <div className="flex items-center gap-1 mb-3">
        <span className="text-xs font-bold text-amber-500">{lot.rating?.toFixed(1) || '5.0'}</span>
        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        <span className="text-xs text-gray-400 font-semibold">({lot.ratingCount || 0})</span>
      </div>

      <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
        <MapPin className="w-4 h-4" />
        {lot.address}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Car className="w-4 h-4" />
          {total} slots
        </div>
        <div className="text-sm font-medium text-parking-primary">
          ₱{lot.ratePerHour}/hr
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${percentage > 50 ? 'bg-green-500' : percentage > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <Link
        to={`/parking/${lot._id}`}
        className="mt-4 block text-center btn-primary text-sm"
      >
        View Details
      </Link>
    </div>
  );
};

export default LotCard;

