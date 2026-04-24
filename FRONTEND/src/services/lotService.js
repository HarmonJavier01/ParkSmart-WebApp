import api from './api.js';
import { ENDPOINTS } from '../constants/endpoints.js';

const lotService = {
  getLots: async () => {
    const response = await api.get(ENDPOINTS.LOTS.BASE);
    return response.data;
  },

  getLotById: async (id) => {
    const response = await api.get(ENDPOINTS.LOTS.BY_ID(id));
    return response.data;
  },

  createLot: async (data) => {
    const response = await api.post(ENDPOINTS.LOTS.BASE, data);
    return response.data;
  },

  updateLot: async (id, data) => {
    const response = await api.put(ENDPOINTS.LOTS.BY_ID(id), data);
    return response.data;
  },

  deleteLot: async (id) => {
    const response = await api.delete(ENDPOINTS.LOTS.BY_ID(id));
    return response.data;
  }
};

export default lotService;

