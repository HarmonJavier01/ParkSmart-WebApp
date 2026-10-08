import { useState } from 'react';
import { Accessibility, Bike, Zap, Clock } from 'lucide-react';
import { formatClockTime, formatElapsed, formatRemaining } from '../../utils/timeFormat.js';

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
  const isOccupied = slot.status === 'occupied';
  const isAvailable = slot.status === 'available';

  const elapsedParked = isOccupied && slot.parkedAt ? formatElapsed(slot.parkedAt, true) : null;
  const elapsedAvailable = isAvailable && slot.availableSince ? formatElapsed(slot.availableSince, true) : null;

  return (
    <div className="relative">
      <button
        onClick={() => slot.status !== 'disabled' && onClick?.(slot)}
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
        className={`slot-cell ${statusClasses[slot.status] || 'slot-disabled'} ${isOffline ? 'ring-2 ring-orange-400' : ''}`}
        disabled={slot.status === 'disabled'}
        title={`Slot ${slot.slotNumber} - Click for details`}
      >
        <div className="flex items-center gap-1">
          {TypeIcon && <TypeIcon className="w-3.5 h-3.5 shrink-0" />}
          <span className="text-xs font-black tracking-tight">{slot.slotNumber?.replace('SLOT_', '')}</span>
        </div>

        {/* Real-time Time Indicator Sub-badge */}
        {isOccupied && (
          <span className="mt-0.5 text-[9px] font-bold leading-tight px-1 py-0.5 rounded bg-red-200/90 text-red-900 truncate max-w-[3.8rem] flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5 shrink-0 inline" />
            {elapsedParked || 'busy'}
          </span>
        )}

        {isAvailable && (
          <span className="mt-0.5 text-[9px] font-semibold leading-tight px-1 py-0.5 rounded bg-emerald-100 text-emerald-800 truncate max-w-[3.8rem]">
            {elapsedAvailable ? `${elapsedAvailable} free` : 'open'}
          </span>
        )}
      </button>

      {showTooltip && tooltipVisible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2.5 bg-gray-950/95 text-white text-xs rounded-xl whitespace-nowrap shadow-xl border border-gray-800 pointer-events-none min-w-[160px]">
          <div className="flex items-center justify-between gap-2 border-b border-gray-800 pb-1 mb-1.5">
            <span className="font-extrabold text-sm text-gray-100">{slot.slotNumber?.replace('_', ' ')}</span>
            <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded ${
              isOccupied ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
            }`}>
              {slot.status}
            </span>
          </div>

          <p className="capitalize text-gray-400 text-[11px] mb-1">Type: <span className="text-gray-200 font-semibold">{slot.type}</span></p>

          {/* Occupied timing details */}
          {isOccupied && (
            <div className="space-y-0.5 text-[11px] text-gray-300">
              <p>⏱️ <span className="text-gray-400">Parked for:</span> <span className="font-bold text-amber-300">{formatElapsed(slot.parkedAt)}</span></p>
              {slot.parkedAt && (
                <p>🔴 <span className="text-gray-400">Detected:</span> <span className="font-bold">{formatClockTime(slot.parkedAt)}</span></p>
              )}
            </div>
          )}

          {/* Available timing details */}
          {isAvailable && (
            <div className="space-y-0.5 text-[11px] text-gray-300">
              <p>🟢 <span className="text-gray-400">Free for:</span> <span className="font-bold text-emerald-400">{formatElapsed(slot.availableSince)}</span></p>
              <p className="text-[10px] text-emerald-400 font-medium">Slot Vacant (Sensor Clear)</p>
            </div>
          )}

          {slot.sensorId && (
            <p className="text-[10px] text-gray-500 mt-1 pt-1 border-t border-gray-800">Sensor: {slot.sensorId}</p>
          )}

          <p className="text-[10px] text-teal-400 font-semibold mt-1">📡 Sensor Monitored (Click for details)</p>
        </div>
      )}
    </div>
  );
};

export default SlotCell;
