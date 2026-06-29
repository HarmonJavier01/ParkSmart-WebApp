import { useState, useEffect, useCallback } from 'react';
import esp32Service from '../services/esp32Service.js';

export const useESP32 = (pollInterval = null) => {
  const [sensorData, setSensorData] = useState(null);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkStatus = useCallback(async () => {
    try {
      const data = await esp32Service.getStatus();
      setSensorData(data.data || null);
      setOnline(data.online);
      setError(null);
    } catch (err) {
      setOnline(false);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAndUpdate = useCallback(async (slotId, lotId, sensorId) => {
    try {
      const result = await esp32Service.fetchAndUpdate(slotId, lotId, sensorId);
      setSensorData(result.data || null);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  useEffect(() => {
    checkStatus();

    if (pollInterval && pollInterval > 0) {
      const interval = setInterval(checkStatus, pollInterval);
      return () => clearInterval(interval);
    }
  }, [checkStatus, pollInterval]);

  return {
    sensorData,
    online,
    loading,
    error,
    checkStatus,
    fetchAndUpdate
  };
};

export default useESP32;
