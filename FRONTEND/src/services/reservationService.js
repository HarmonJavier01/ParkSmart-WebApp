import api from './api.js';
import { ENDPOINTS } from '../constants/endpoints.js';

const reservationService = {
  createReservation: async (data) => {
    const response = await api.post(ENDPOINTS.RESERVATIONS.BASE, data);
    return response.data;
  },

  getReservation: async (id) => {
    const response = await api.get(ENDPOINTS.RESERVATIONS.BY_ID(id));
    return response.data;
  },

  getUserReservations: async (userId) => {
    const response = await api.get(ENDPOINTS.RESERVATIONS.BY_USER(userId));
    return response.data;
  },

  getAllReservations: async (params = {}) => {
    const response = await api.get(ENDPOINTS.RESERVATIONS.BASE, { params });
    return response.data;
  },

  cancelReservation: async (id) => {
    const response = await api.patch(ENDPOINTS.RESERVATIONS.CANCEL(id));
    return response.data;
  },

  completeReservation: async (id) => {
    const response = await api.patch(ENDPOINTS.RESERVATIONS.COMPLETE(id));
    return response.data;
  }
};

export default reservationService;

