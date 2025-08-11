import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { 
  authenticateToken, 
  requireAuth, 
  requireAdmin, 
  requireManager 
} from '../middleware/auth';

const router = Router();
const productController = new ProductController();

// Public routes (for search functionality)
router.get('/search', productController.searchProducts);

// Protected routes (authentication required)
router.get('/', authenticateToken, productController.getProducts);
router.get('/:id', authenticateToken, productController.getProduct);

// Manager and Admin only routes
router.post('/', authenticateToken, requireManager, productController.createProduct);
router.put('/:id', authenticateToken, requireManager, productController.updateProduct);

// Admin only routes
router.delete('/:id', authenticateToken, requireAdmin, productController.deleteProduct);

export default router; 