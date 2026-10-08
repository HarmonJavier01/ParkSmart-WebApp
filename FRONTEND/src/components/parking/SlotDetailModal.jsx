import { useState, useEffect } from 'react';
import { 
  X, Clock, Car, CheckCircle, AlertCircle, 
  Accessibility, Bike, Zap, Timer, ArrowRight, ShieldCheck
} from 'lucide-react';
import slotService from '../../services/slotService.js';
import { formatClockTime, formatElapsed, formatRemaining } from '../../utils/timeFormat.js';

const typeIcons = {
  PWD: Accessibility,
  motorcycle: Bike,
  ev: Zap,
  regular: Car
};

const SlotDetailModal = ({ slot, isOpen, onClose, onUpdated }) => {
  const [selectedDurationMin, setSelectedDurationMin] = useState(120);
  const [occupiedByInput, setOccupiedByInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [, setTick] = useState(0);

  // Live timer tick every 10 seconds to refresh elapsed time
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

  const startTimeStr = slot.parkedAt ? formatClockTime(slot.parkedAt) : 'N/A';
  const endTimeStr = slot.expectedEndTime ? formatClockTime(slot.expectedEndTime) : 'N/A';
  const elapsedParkedStr = slot.parkedAt ? formatElapsed(slot.parkedAt) : 'Recently';
  const remainingParkedStr = slot.expectedEndTime ? formatRemaining(slot.expectedEndTime) : '';
  const availableDurationStr = slot.availableSince ? formatElapsed(slot.availableSince) : 'Just now';

  // Preview end time when starting parking
  const previewEndTime = new Date(Date.now() + selectedDurationMin * 60 * 1000);
  const previewEndTimeStr = formatClockTime(previewEndTime);

  const handleStartParking = async () => {
    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await slotService.startParking(slot._id, {
        durationMinutes: selectedDurationMin,
        occupiedBy: occupiedByInput.trim() || 'Visitor Vehicle'
      });
      if (onUpdated) onUpdated(res.slot);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to start parking session.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndParking = async () => {
    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await slotService.endParking(slot._id);
      if (onUpdated) onUpdated(res.slot);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to end parking session.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-outfit">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 pb-4 border-b flex items-center justify-between ${
          isOccupied ? 'bg-red-50/50 border-red-100' : 'bg-emerald-50/50 border-emerald-100'
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
                <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                  isOccupied ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {slot.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 capitalize">{slot.type} slot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* OCCUPIED VIEW */}
          {isOccupied && (
            <div className="space-y-4">
              {/* Live Ticker Card */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-red-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    Live Parking Session
                  </span>
                  <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-red-500" />
                    Real-time
                  </span>
                </div>
                <div className="text-2xl font-black text-gray-800 tracking-tight">
                  {elapsedParkedStr} <span className="text-xs font-normal text-gray-500">parked</span>
                </div>
                {remainingParkedStr && (
                  <p className="text-xs text-amber-700 font-semibold mt-1">
                    ⏱️ Available {remainingParkedStr}
                  </p>
                )}
              </div>

              {/* Start & End Time Schedule Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3.5">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Time Started
                  </span>
                  <div className="text-sm font-extrabold text-gray-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    {startTimeStr}
                  </div>
                  <span className="text-[10px] text-gray-400">Park start</span>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3.5">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Expected End
                  </span>
                  <div className="text-sm font-extrabold text-gray-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-red-500" />
                    {endTimeStr}
                  </div>
                  <span className="text-[10px] text-gray-400">Est. departure</span>
                </div>
              </div>

              {slot.occupiedBy && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-medium">Driver / Vehicle:</span>
                  <span className="font-bold text-gray-700">{slot.occupiedBy}</span>
                </div>
              )}

              {/* End Parking Action */}
              <div className="pt-2">
                <button
                  onClick={handleEndParking}
                  disabled={submitting}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  {submitting ? 'Updating...' : 'End Parking (Vacate Slot)'}
                </button>
                <p className="text-[11px] text-gray-400 text-center mt-2">
                  Vacating the slot will mark it Available immediately for other drivers.
                </p>
              </div>
            </div>
          )}

          {/* AVAILABLE VIEW */}
          {isAvailable && (
            <div className="space-y-4">
              {/* Availability Status Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Currently Vacant
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                    Ready to Park
                  </span>
                </div>
                <div className="text-lg font-black text-gray-800">
                  Available for {availableDurationStr}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This space is open and ready. Start parking below to display real-time parking timer to other users.
                </p>
              </div>

              {/* Parking Duration Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Select Parking Duration:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '30m', mins: 30 },
                    { label: '1 hour', mins: 60 },
                    { label: '2 hours', mins: 120 },
                    { label: '3 hours', mins: 180 },
                  ].map((dur) => (
                    <button
                      key={dur.mins}
                      type="button"
                      onClick={() => setSelectedDurationMin(dur.mins)}
                      className={`py-2 px-1 text-xs font-bold rounded-xl border transition ${
                        selectedDurationMin === dur.mins
                          ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-100'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Preview Box */}
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Time Start</span>
                  <span className="font-extrabold text-gray-800">{formatClockTime(new Date())}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-teal-600" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Estimated End</span>
                  <span className="font-extrabold text-teal-700">{previewEndTimeStr}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Duration</span>
                  <span className="font-extrabold text-gray-800">{selectedDurationMin / 60 >= 1 ? `${selectedDurationMin / 60}h` : `${selectedDurationMin}m`}</span>
                </div>
              </div>

              {/* Optional Vehicle note */}
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">
                  Vehicle / Plate (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Toyota Vios (ABC-1234)"
                  value={occupiedByInput}
                  onChange={(e) => setOccupiedByInput(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              {/* Start Parking Button */}
              <div className="pt-2">
                <button
                  onClick={handleStartParking}
                  disabled={submitting}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Car className="w-4 h-4" />
                  {submitting ? 'Setting up...' : 'Start Parking Here (Mark Occupied)'}
                </button>
                <p className="text-[11px] text-gray-400 text-center mt-2">
                  Broadcasts real-time occupancy to all users viewing this parking lot.
                </p>
              </div>
            </div>
          )}

          {/* SENSOR FOOTER */}
          {slot.sensorId && (
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                Linked Sensor: {slot.sensorId}
              </span>
              <span>
                {slot.lastPingAt ? `Ping: ${formatClockTime(slot.lastPingAt)}` : 'Sensor Active'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlotDetailModal;
