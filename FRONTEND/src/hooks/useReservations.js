import { useState, useEffect, useCallback } from 'react';
import reservationService from '../services/reservationService.js';

export const useReservations = (userId = null) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      let data;
      if (userId) {
        data = await reservationService.getUserReservations(userId);
      } else {
        data = await reservationService.getAllReservations();
      }
      setReservations(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const cancelReservation = async (id) => {
    await reservationService.cancelReservation(id);
    setReservations((prev) =>
      prev.map((r) => (r._id === id ? { ...r, status: 'cancelled' } : r))
    );
  };

  return { reservations, loading, error, refetch: fetchReservations, cancelReservation };
};

export default useReservations;

