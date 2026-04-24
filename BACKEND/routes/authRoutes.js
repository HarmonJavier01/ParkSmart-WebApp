import express from 'express';
import { register, login, adminLogin } from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/admin/login', authLimiter, adminLogin);

export default router;

