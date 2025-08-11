import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const dashboardController = new DashboardController();

// Get dashboard statistics
router.get('/stats', authenticateToken, dashboardController.getDashboardStats);

export default router; 