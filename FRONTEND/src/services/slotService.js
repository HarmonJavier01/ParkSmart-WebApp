import api from './api.js';
import { ENDPOINTS } from '../constants/endpoints.js';

const slotService = {
  getSlotsByLot: async (lotId) => {
    const response = await api.get(ENDPOINTS.SLOTS.BY_LOT(lotId));
    return response.data;
  },

  updateSlot: async (id, data) => {
    const response = await api.put(ENDPOINTS.SLOTS.UPDATE(id), data);
    return response.data;
  },

  startParking: async (id, data = {}) => {
    const response = await api.post(ENDPOINTS.SLOTS.START_PARKING(id), data);
    return response.data;
  },

  endParking: async (id) => {
    const response = await api.post(ENDPOINTS.SLOTS.END_PARKING(id));
    return response.data;
  },

  sensorUpdate: async (data) => {
    const response = await api.post(ENDPOINTS.SLOTS.SENSOR_UPDATE, data);
    return response.data;
  }
};

export default slotService;
