import api from './api.js';
import { ENDPOINTS } from '../constants/endpoints.js';

const reportService = {
  getDaily: async (params = {}) => {
    const response = await api.get(ENDPOINTS.REPORTS.DAILY, { params });
    return response.data;
  },

  getHourlyHeatmap: async (params = {}) => {
    const response = await api.get(ENDPOINTS.REPORTS.HOURLY_HEATMAP, { params });
    return response.data;
  },

  getRevenue: async (params = {}) => {
    const response = await api.get(ENDPOINTS.REPORTS.REVENUE, { params });
    return response.data;
  },

  getSensorLogs: async (params = {}) => {
    const response = await api.get(ENDPOINTS.REPORTS.SENSOR_LOGS, { params });
    return response.data;
  }
};

export default reportService;

