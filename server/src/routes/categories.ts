import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { 
  authenticateToken, 
  requireAuth, 
  requireAdmin, 
  requireManager 
} from '../middleware/auth';

const router = Router();
const categoryController = new CategoryController();

// Protected routes (authentication required)
router.get('/', authenticateToken, categoryController.getCategories);
router.get('/:id', authenticateToken, categoryController.getCategory);

// Manager and Admin only routes
router.post('/', authenticateToken, requireManager, categoryController.createCategory);
router.put('/:id', authenticateToken, requireManager, categoryController.updateCategory);

// Admin only routes
router.delete('/:id', authenticateToken, requireAdmin, categoryController.deleteCategory);

export default router; 