import { Wifi, WifiOff } from 'lucide-react';

const SensorHealthRow = ({ sensors = [] }) => {
  return (
    <div className="card">
      <h3 className="font-bold text-lg mb-4">Sensor Health</h3>
      <div className="space-y-3">
        {sensors.map((sensor) => {
          const isOnline = sensor.lastPingAt && (Date.now() - new Date(sensor.lastPingAt).getTime() < 5 * 60 * 1000);

          return (
            <div key={sensor._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="font-medium text-sm">{sensor.sensorId}</p>
                <p className="text-xs text-gray-500">{sensor.lotId?.name} / {sensor.slotId?.slotNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                    <Wifi className="w-4 h-4" /> Online
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
                    <WifiOff className="w-4 h-4" /> Offline
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {sensors.length === 0 && (
          <p className="text-center text-gray-400 py-4">No sensor data</p>
        )}
      </div>
    </div>
  );
};

export default SensorHealthRow;

