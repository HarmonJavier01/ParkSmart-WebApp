import express from 'express';
import { getUsers, updateUserStatus, getCurrentUser } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/me', protect, getCurrentUser);
router.get('/', protect, requireAdmin, getUsers);
router.patch('/:id/status', protect, requireAdmin, updateUserStatus);

export default router;

