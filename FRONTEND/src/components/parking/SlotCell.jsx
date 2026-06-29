import { useState } from 'react';
import { Accessibility, Bike, Zap } from 'lucide-react';

const typeIcons = {
  PWD: Accessibility,
  motorcycle: Bike,
  ev: Zap
};

const SlotCell = ({ slot, onClick, showTooltip = true }) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const statusClasses = {
    available: 'slot-available',
    occupied: 'slot-occupied',
    reserved: 'slot-reserved',
    disabled: 'slot-disabled'
  };

  const TypeIcon = typeIcons[slot.type];

  const isOffline = slot.lastPingAt && (Date.now() - new Date(slot.lastPingAt).getTime() > 5 * 60 * 1000);

  return (
    <div className="relative">
      <button
        onClick={() => slot.status !== 'disabled' && onClick?.(slot)}
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
        className={`slot-cell ${statusClasses[slot.status] || 'slot-disabled'} ${isOffline ? 'ring-2 ring-orange-400' : ''}`}
        disabled={slot.status === 'disabled'}
      >
        {TypeIcon && <TypeIcon className="w-4 h-4" />}
        <span className="text-xs">{slot.slotNumber?.replace('SLOT_', '')}</span>
      </button>

      {showTooltip && tooltipVisible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap shadow-lg">
          <p className="font-bold">{slot.slotNumber}</p>
          <p className="capitalize">{slot.type}</p>
          <p className="capitalize">{slot.status}</p>
          {slot.sensorId && <p>Sensor: {slot.sensorId}</p>}
          {slot.lastPingAt && (
            <p>Last ping: {new Date(slot.lastPingAt).toLocaleTimeString()}</p>
          )}
          {isOffline && <p className="text-orange-400 font-bold">Offline over 5min</p>}
        </div>
      )}
    </div>
  );
};

export default SlotCell;

