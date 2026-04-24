import api from './api.js';
import { ENDPOINTS } from '../constants/endpoints.js';

const userService = {
  getUsers: async () => {
    const response = await api.get(ENDPOINTS.USERS.BASE);
    return response.data;
  },

  updateUserStatus: async (id, isActive) => {
    const response = await api.patch(ENDPOINTS.USERS.STATUS(id), { isActive });
    return response.data;
  }
};

export default userService;

