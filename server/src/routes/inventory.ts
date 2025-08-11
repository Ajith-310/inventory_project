import { Router } from 'express';
import { InventoryController } from '../controllers/inventoryController';
import { 
  authenticateToken, 
  requireAuth, 
  requireAdmin, 
  requireManager 
} from '../middleware/auth';

const router = Router();
const inventoryController = new InventoryController();

// Protected routes (authentication required)
router.get('/', authenticateToken, inventoryController.getInventory);
router.get('/search', authenticateToken, inventoryController.searchInventory);
router.get('/low-stock', authenticateToken, inventoryController.getLowStockItems);
router.get('/summary', authenticateToken, inventoryController.getInventorySummary);
router.get('/:id', authenticateToken, inventoryController.getInventoryItem);

// Manager and Admin only routes
router.post('/', authenticateToken, requireManager, inventoryController.createInventoryItem);
router.put('/:id', authenticateToken, requireManager, inventoryController.updateInventoryItem);

// Admin only routes
router.delete('/:id', authenticateToken, requireAdmin, inventoryController.deleteInventoryItem);

export default router; 