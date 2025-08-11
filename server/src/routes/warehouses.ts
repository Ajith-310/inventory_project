import { Router } from 'express';
import { WarehouseController } from '../controllers/warehouseController';
import { 
  authenticateToken, 
  requireAuth, 
  requireAdmin, 
  requireManager 
} from '../middleware/auth';

const router = Router();
const warehouseController = new WarehouseController();

// Protected routes (authentication required)
router.get('/', authenticateToken, warehouseController.getWarehouses);
router.get('/search', authenticateToken, warehouseController.searchWarehouses);
router.get('/:id', authenticateToken, warehouseController.getWarehouse);

// Manager and Admin only routes
router.post('/', authenticateToken, requireManager, warehouseController.createWarehouse);
router.put('/:id', authenticateToken, requireManager, warehouseController.updateWarehouse);

// Admin only routes
router.delete('/:id', authenticateToken, requireAdmin, warehouseController.deleteWarehouse);

export default router; 