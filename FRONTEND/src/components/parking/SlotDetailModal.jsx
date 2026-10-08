import { useState, useEffect } from 'react';
import { 
  X, Clock, Car, Accessibility, Bike, Zap, 
  Timer, ShieldCheck, Cpu, Radio
} from 'lucide-react';
import { formatClockTime, formatElapsed } from '../../utils/timeFormat.js';

const typeIcons = {
  PWD: Accessibility,
  motorcycle: Bike,
  ev: Zap,
  regular: Car
};

const SlotDetailModal = ({ slot, isOpen, onClose }) => {
  const [, setTick] = useState(0);

  // Live timer tick every 10 seconds to keep elapsed time accurate
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !slot) return null;

  const TypeIcon = typeIcons[slot.type] || Car;
  const isOccupied = slot.status === 'occupied';
  const isAvailable = slot.status === 'available';

  const startTimeStr = slot.parkedAt ? formatClockTime(slot.parkedAt) : 'Recently detected';
  const elapsedParkedStr = slot.parkedAt ? formatElapsed(slot.parkedAt) : 'Recently';
  const availableDurationStr = slot.availableSince ? formatElapsed(slot.availableSince) : 'Just now';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-outfit">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 pb-4 border-b flex items-center justify-between ${
          isOccupied ? 'bg-red-50/60 border-red-100' : 'bg-emerald-50/60 border-emerald-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isOccupied ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
            }`}>
              <TypeIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-xl text-gray-800">{slot.slotNumber?.replace('_', ' ')}</h3>
                <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full ${
                  isOccupied ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  {slot.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 capitalize">{slot.type} Parking Space</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* OCCUPIED VIEW */}
          {isOccupied && (
            <div className="space-y-4">
              {/* Live Sensor Ticker Card */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-red-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    Vehicle Detected
                  </span>
                  <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-red-500" />
                    Real-time Sensor
                  </span>
                </div>
                <div className="text-2xl font-black text-gray-800 tracking-tight">
                  {elapsedParkedStr} <span className="text-xs font-normal text-gray-500">parked</span>
                </div>
                <p className="text-xs text-gray-600 mt-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>Detected at: <strong>{startTimeStr}</strong></span>
                </p>
              </div>

              {/* Sensor Automation Explainer */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3.5 text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-gray-700">
                  <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  <span>Hardware Sensor Active</span>
                </div>
                <p className="leading-relaxed">
                  This slot is occupied based on live IoT sensor readings. Status will automatically update to <strong>Available</strong> once the vehicle vacates the space.
                </p>
              </div>
            </div>
          )}

          {/* AVAILABLE VIEW */}
          {isAvailable && (
            <div className="space-y-4">
              {/* Vacant Status Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Slot Vacant & Clear
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                    Ready to Park
                  </span>
                </div>
                <div className="text-2xl font-black text-gray-800 tracking-tight">
                  Available for {availableDurationStr}
                </div>
                <p className="text-xs text-emerald-800/80 mt-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Open since: <strong>{slot.availableSince ? formatClockTime(slot.availableSince) : 'Recent'}</strong></span>
                </p>
              </div>

              {/* Sensor Automation Explainer */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3.5 text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-gray-700">
                  <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>Hardware Sensor Monitoring</span>
                </div>
                <p className="leading-relaxed">
                  This slot is clear and open for parking. When a vehicle parks, the IoT hardware sensor will automatically detect it and mark it <strong>Occupied</strong> in real time.
                </p>
              </div>
            </div>
          )}

          {/* HARDWARE SENSOR METADATA */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-semibold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-teal-600" />
                Linked Sensor
              </span>
              <span className="font-bold text-gray-700">
                {slot.sensorId || `ESP32-NODE-${slot.slotNumber?.replace('SLOT_', '')}`}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
              <span className="text-gray-400 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                Detection Mode
              </span>
              <span className="font-bold text-teal-700">
                Automated IoT Sensor
              </span>
            </div>
          </div>

          {/* Close Action */}
          <div className="pt-1">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotDetailModal;
