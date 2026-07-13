import express from 'express';
import { getLotReviews, createReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:lotId', getLotReviews);
router.post('/:lotId', createReview);

export default router;
