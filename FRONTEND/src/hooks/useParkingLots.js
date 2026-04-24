import { useState, useEffect, useCallback } from 'react';
import lotService from '../services/lotService.js';
import { useSocketEvent } from './useSocket.js';

export const useParkingLots = () => {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLots = useCallback(async () => {
    try {
      setLoading(true);
      const data = await lotService.getLots();
      setLots(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLots();
  }, [fetchLots]);

  useSocketEvent('lot:update', (updatedLot) => {
    setLots((prev) =>
      prev.map((lot) => (lot._id === updatedLot._id ? { ...lot, ...updatedLot } : lot))
    );
  });

  return { lots, loading, error, refetch: fetchLots };
};

export default useParkingLots;

