import express from 'express';
import {
  createReservation,
  getReservationById,
  getUserReservations,
  getAllReservations,
  cancelReservation,
  completeReservation
} from '../controllers/reservationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.post('/', createReservation);
router.get('/user/:userId', protect, getUserReservations);
router.get('/:id', getReservationById);
router.get('/', protect, requireAdmin, getAllReservations);
router.patch('/:id/cancel', protect, cancelReservation);
router.patch('/:id/complete', protect, requireAdmin, completeReservation);

export default router;

