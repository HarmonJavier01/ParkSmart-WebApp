import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import useESP32 from '../../hooks/useESP32.js';

const ESP32StatusPanel = () => {
  // Auto-poll every 3 seconds
  const { sensorData, online, loading, checkStatus } = useESP32(3000);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          {online ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-500" />
          )}
          ESP32 Sensor
        </h3>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${
              online
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {online ? 'Online' : 'Offline'}
          </span>
          <button
            onClick={checkStatus}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {online && sensorData ? (
        <div className="grid grid-cols-3 gap-4">
          {/* Distance */}
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Distance</p>
            <p className="text-2xl font-bold text-gray-800">
              {sensorData.distance}
            </p>
            <p className="text-xs text-gray-400">cm</p>
          </div>

          {/* Status */}
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <p
              className={`text-lg font-bold capitalize ${
                sensorData.status === 'occupied'
                  ? 'text-red-600'
                  : 'text-green-600'
              }`}
            >
              {sensorData.status}
            </p>
          </div>

          {/* LED */}
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">LED</p>
            <div className="flex items-center justify-center gap-2">
              <span
                className={`w-4 h-4 rounded-full inline-block ${
                  sensorData.led === 'red'
                    ? 'bg-red-500 shadow-red-300 shadow-md'
                    : sensorData.led === 'green'
                    ? 'bg-green-500 shadow-green-300 shadow-md'
                    : 'bg-gray-300'
                }`}
              />
              <span className="text-sm font-medium capitalize text-gray-700">
                {sensorData.led}
              </span>
            </div>
          </div>
        </div>
      ) : !online ? (
        <div className="text-center py-8 text-gray-400">
          <WifiOff className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">ESP32 sensor is not reachable</p>
          <p className="text-xs mt-1">Check if the device is powered on and connected to WiFi</p>
        </div>
      ) : null}
    </div>
  );
};

export default ESP32StatusPanel;
