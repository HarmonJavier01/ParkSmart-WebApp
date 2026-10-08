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

  const labelText = slot.slotNumber
    ? String(slot.slotNumber).replace(/^SLOT_/i, '').replace(/^lot_/i, '')
    : '';

  const markerLabel = {
    text: labelText,
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: 'bold'
  };

  const timingTitle = isAvailable
    ? `Slot ${slot.slotNumber} (AVAILABLE) - Free for ${slot.availableSince ? new Date(slot.availableSince).toLocaleTimeString() : 'now'}`
    : `Slot ${slot.slotNumber} (OCCUPIED) - ${slot.parkedAt ? `Started: ${new Date(slot.parkedAt).toLocaleTimeString()}` : ''} ${slot.expectedEndTime ? `Until: ${new Date(slot.expectedEndTime).toLocaleTimeString()}` : ''}`;

  return (
    <Marker
      position={position}
      icon={markerIcon}
      label={markerLabel}
      title={timingTitle}
    />
  );
};

export default SlotMarker;
