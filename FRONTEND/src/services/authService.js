import axios from 'axios';
import { ENDPOINTS } from '../constants/endpoints.js';

const authService = {
  register: async (data) => {
    const response = await axios.post(ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  login: async (data) => {
    const response = await axios.post(ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  },

  adminLogin: async (data) => {
    const response = await axios.post(ENDPOINTS.AUTH.ADMIN_LOGIN, data);
    return response.data;
  }
};

export default authService;

