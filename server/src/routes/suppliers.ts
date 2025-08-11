import { Router } from 'express';
import { SupplierController } from '../controllers/supplierController';
import { 
  authenticateToken, 
  requireAuth, 
  requireAdmin, 
  requireManager 
} from '../middleware/auth';

const router = Router();
const supplierController = new SupplierController();

// Protected routes (authentication required)
router.get('/', authenticateToken, supplierController.getSuppliers);
router.get('/:id', authenticateToken, supplierController.getSupplier);

// Manager and Admin only routes
router.post('/', authenticateToken, requireManager, supplierController.createSupplier);
router.put('/:id', authenticateToken, requireManager, supplierController.updateSupplier);

// Admin only routes
router.delete('/:id', authenticateToken, requireAdmin, supplierController.deleteSupplier);

export default router; 