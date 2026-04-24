import { useState, useEffect, useCallback } from 'react';
import slotService from '../services/slotService.js';
import { useSocketEvent } from './useSocket.js';

export const useSlots = (lotId) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSlots = useCallback(async () => {
    if (!lotId) return;
    try {
      setLoading(true);
      const data = await slotService.getSlotsByLot(lotId);
      setSlots(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [lotId]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  useSocketEvent('slot:update', (updatedSlot) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot._id === updatedSlot.slotId ? { ...slot, status: updatedSlot.status } : slot
      )
    );
  });

  return { slots, loading, error, refetch: fetchSlots };
};

export default useSlots;

