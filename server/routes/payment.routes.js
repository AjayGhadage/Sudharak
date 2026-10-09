import express from 'express';
import { initiateDonation, captureDonation } from '../controllers/payment.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/create-order', authenticateToken, initiateDonation);
router.post('/capture', authenticateToken, captureDonation);

export default router;
