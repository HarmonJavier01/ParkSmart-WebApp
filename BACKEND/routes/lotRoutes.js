import express from 'express';
import { getLots, getLotById, createLot, updateLot, deleteLot } from '../controllers/lotController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/', getLots);
router.get('/:id', getLotById);
router.post('/', protect, requireAdmin, createLot);
router.put('/:id', protect, requireAdmin, updateLot);
router.delete('/:id', protect, requireAdmin, deleteLot);

export default router;

