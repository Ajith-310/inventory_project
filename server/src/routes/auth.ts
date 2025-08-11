import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { 
  authenticateToken, 
  requireAuth, 
  requireAdmin, 
  requireManager 
} from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// Public routes (no authentication required)
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh', authController.refreshToken);

// Protected routes (authentication required)
router.get('/me', authenticateToken, authController.getCurrentUser);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/change-password', authenticateToken, authController.changePassword);

// Admin only routes
router.get('/users', authenticateToken, requireAdmin, authController.getAllUsers);
router.put('/users/:userId/role', authenticateToken, requireAdmin, authController.updateUserRole);
router.delete('/users/:userId', authenticateToken, requireAdmin, authController.deactivateUser);

export default router; 