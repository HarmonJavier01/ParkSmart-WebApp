import { MapContainer, TileLayer } from 'react-leaflet';
import LotMarker from './LotMarker.jsx';

const ParkingMap = ({ lots, center = [15.9766, 120.4869], zoom = 15 }) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className="w-full h-full rounded-xl z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {lots.map((lot) => (
        <LotMarker key={lot._id} lot={lot} />
      ))}
    </MapContainer>
  );
};

export default ParkingMap;

