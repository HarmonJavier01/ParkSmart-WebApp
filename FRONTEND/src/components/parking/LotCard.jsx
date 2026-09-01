import { MapPin, Car, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

import { normalizeImageUrl, handleImageError } from '../../utils/imageHelper.js';

const LotCard = ({ lot, onMouseEnter, onMouseLeave }) => {
  const available = lot.availableSlots || 0;
  const total = lot.totalSlots || 1;
  const percentage = Math.round((available / total) * 100);

  return (
    <div 
      className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer overflow-hidden flex flex-col"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Lot Image and Availability Badge */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        <img 
          src={normalizeImageUrl(lot.imageUrl)} 
          onError={(e) => handleImageError(e)}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
          alt={lot.name || "Parking Lot"} 
        />
        <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-md text-white ${
          percentage > 50 ? 'bg-green-600' : percentage > 20 ? 'bg-amber-500' : 'bg-red-600'
        }`}>
          {available} available
        </span>
      </div>

      {/* Lot Details Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="font-bold text-lg text-gray-900 leading-tight">{lot.name}</h3>
            <div className="flex items-center gap-1 text-amber-500 font-semibold text-sm shrink-0">
              <Star className="w-4 h-4 text-amber-500" />
              <span>{lot.rating?.toFixed(1) || '5.0'}</span>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="truncate">{lot.address}</span>
          </p>

          <div className="border-t border-gray-100 pt-3 flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Car className="w-4 h-4 text-gray-400" />
              <span>{total} slots</span>
            </div>
            {/* TODO: Pricing must be removed. Commented out as requested. */}
            {/* <div className="text-base font-bold text-gray-900">
              ₱{lot.ratePerHour}/hr
            </div> */}
          </div>
        </div>

        <div>
          {/* Occupancy Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center text-xs font-semibold mb-1">
              <span className="text-gray-500">Occupancy</span>
              <span className={percentage > 50 ? 'text-green-600' : percentage > 20 ? 'text-amber-600' : 'text-red-600'}>
                {percentage}% Available
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  percentage > 50 ? 'bg-green-500' : percentage > 20 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <Link
            to={`/parking/${lot._id}`}
            className="block w-full text-center bg-[#063b31] hover:bg-[#042c25] text-white py-2.5 rounded-lg font-semibold transition duration-200 text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LotCard;

