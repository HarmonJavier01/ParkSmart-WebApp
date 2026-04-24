import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';

const createCustomIcon = (available) => {
  const color = available > 0 ? 'bg-green-500' : 'bg-red-500';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="${color} w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">${available}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const LotMarker = ({ lot }) => {
  const available = lot.availableSlots || 0;

  return (
    <Marker
      position={[lot.lat, lot.lng]}
      icon={createCustomIcon(available)}
    >
      <Popup>
        <div className="text-center">
          <h3 className="font-bold text-sm">{lot.name}</h3>
          <p className="text-xs text-gray-600">{lot.address}</p>
          <p className="text-xs font-medium mt-1">{available} / {lot.totalSlots} available</p>
          <p className="text-xs text-parking-primary font-bold">₱{lot.ratePerHour}/hr</p>
          <Link
            to={`/parking/${lot._id}`}
            className="text-xs text-teal-600 hover:underline mt-2 inline-block"
          >
            View Details
          </Link>
        </div>
      </Popup>
    </Marker>
  );
};

export default LotMarker;

