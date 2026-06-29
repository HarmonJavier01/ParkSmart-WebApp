import api from './api.js';
import { ENDPOINTS } from '../constants/endpoints.js';

const esp32Service = {
  /**
   * Check if the ESP32 sensor is online and get its current reading.
   */
  getStatus: async () => {
    const response = await api.get(ENDPOINTS.ESP32.STATUS);
    return response.data;
  },

  /**
   * Poll the ESP32 and update the linked parking slot.
   * @param {string} slotId - MongoDB slot ID
   * @param {string} lotId - MongoDB lot ID
   * @param {string} sensorId - Sensor identifier string
   */
  fetchAndUpdate: async (slotId, lotId, sensorId) => {
    const response = await api.get(ENDPOINTS.ESP32.FETCH, {
      params: { slotId, lotId, sensorId }
    });
    return response.data;
  },

  /**
   * Get recent sensor reading history.
   * @param {object} params - { sensorId, limit }
   */
  getHistory: async (params = {}) => {
    const response = await api.get(ENDPOINTS.ESP32.HISTORY, { params });
    return response.data;
  }
};

export default esp32Service;
