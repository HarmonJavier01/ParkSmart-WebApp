import api from './api.js';
import { ENDPOINTS } from '../constants/endpoints.js';

const reviewService = {
  getReviewsByLot: async (lotId) => {
    const response = await api.get(ENDPOINTS.REVIEWS.BY_LOT(lotId));
    return response.data;
  },

  createReview: async (lotId, reviewData) => {
    try {
      const response = await api.post(ENDPOINTS.REVIEWS.CREATE(lotId), { ...reviewData, lotId });
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        // Fallback: try base endpoint with lotId in body if param route 404s
        const fallbackRes = await api.post(`${ENDPOINTS.API_BASE}/reviews`, { ...reviewData, lotId });
        return fallbackRes.data;
      }
      throw err;
    }
  }
};

export default reviewService;
