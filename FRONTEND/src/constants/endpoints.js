const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ENDPOINTS = {
  API_BASE,
  AUTH: {
    REGISTER: `${API_BASE}/auth/register`,
    LOGIN: `${API_BASE}/auth/login`,
    ADMIN_LOGIN: `${API_BASE}/auth/admin/login`,
    FORGOT_PASSWORD: `${API_BASE}/auth/forgot-password`,
    VERIFY_OTP: `${API_BASE}/auth/verify-otp`,
    RESEND_OTP: `${API_BASE}/auth/resend-otp`,
    RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
    VERIFY_EMAIL: (token) => `${API_BASE}/auth/verify-email/${token}`
  },
  LOTS: {
    BASE: `${API_BASE}/lots`,
    BY_ID: (id) => `${API_BASE}/lots/${id}`
  },
  SLOTS: {
    BY_LOT: (lotId) => `${API_BASE}/slots/lot/${lotId}`,
    UPDATE: (id) => `${API_BASE}/slots/${id}`,
    SENSOR_UPDATE: `${API_BASE}/slots/sensor-update`
  },
  RESERVATIONS: {
    BASE: `${API_BASE}/reservations`,
    BY_ID: (id) => `${API_BASE}/reservations/${id}`,
    BY_USER: (userId) => `${API_BASE}/reservations/user/${userId}`,
    CANCEL: (id) => `${API_BASE}/reservations/${id}/cancel`,
    COMPLETE: (id) => `${API_BASE}/reservations/${id}/complete`
  },
  USERS: {
    BASE: `${API_BASE}/users`,
    STATUS: (id) => `${API_BASE}/users/${id}/status`
  },
  REPORTS: {
    DAILY: `${API_BASE}/reports/daily`,
    HOURLY_HEATMAP: `${API_BASE}/reports/hourly-heatmap`,
    REVENUE: `${API_BASE}/reports/revenue`,
    SENSOR_LOGS: `${API_BASE}/reports/sensor-logs`
  },
  ESP32: {
    STATUS: `${API_BASE}/esp32/status`,
    FETCH: `${API_BASE}/esp32/fetch`,
    HISTORY: `${API_BASE}/esp32/history`
  },
  REVIEWS: {
    BY_LOT: (lotId) => `${API_BASE}/reviews/${lotId}`,
    CREATE: (lotId) => `${API_BASE}/reviews/${lotId}`
  }
};

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

