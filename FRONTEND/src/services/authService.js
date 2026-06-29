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
  },
  
  verifyOTP: async (email, otp) => {
    const response = await axios.post(ENDPOINTS.AUTH.VERIFY_OTP, { email, otp });
    return response.data;
  },

  resendOTP: async (email) => {
    const response = await axios.post(ENDPOINTS.AUTH.RESEND_OTP, { email });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axios.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return response.data;
  },

  resetPassword: async (email, otp, password) => {
    const response = await axios.post(ENDPOINTS.AUTH.RESET_PASSWORD, { email, otp, password });
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await axios.get(ENDPOINTS.AUTH.VERIFY_EMAIL(token));
    return response.data;
  }
};

export default authService;
