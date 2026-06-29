import { Marker } from '@react-google-maps/api';

const SlotMarker = ({ slot, position }) => {
  const isAvailable = slot.status === 'available';
  const markerColor = isAvailable ? '#22c55e' : '#ef4444';

  const markerIcon = {
    path: window.google ? window.google.maps.SymbolPath.CIRCLE : 0,
    fillColor: markerColor,
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 1.5,
    scale: 10
  };

  const markerLabel = {
    text: slot.slotNumber,
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: 'bold'
  };

  return (
    <Marker
      position={position}
      icon={markerIcon}
      label={markerLabel}
      title={`Slot ${slot.slotNumber} - ${slot.status}`}
    />
  );
};

export default SlotMarker;
