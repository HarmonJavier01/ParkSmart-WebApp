import api from './api.js';
import { ENDPOINTS } from '../constants/endpoints.js';

const reviewService = {
  getReviewsByLot: async (lotId) => {
    const response = await api.get(ENDPOINTS.REVIEWS.BY_LOT(lotId));
    return response.data;
  },

  createReview: async (lotId, reviewData) => {
    const response = await api.post(ENDPOINTS.REVIEWS.CREATE(lotId), reviewData);
    return response.data;
  }
};

export default reviewService;
