import { Router } from 'express';
import { PurchaseOrderController } from '../controllers/purchaseOrderController';
import { 
  authenticateToken, 
  requireAuth, 
  requireAdmin, 
  requireManager 
} from '../middleware/auth';

const router = Router();
const purchaseOrderController = new PurchaseOrderController();

// Protected routes (authentication required)
router.get('/', authenticateToken, purchaseOrderController.getPurchaseOrders);
router.get('/search', authenticateToken, purchaseOrderController.searchPurchaseOrders);
router.get('/stats', authenticateToken, purchaseOrderController.getPurchaseOrderStats);
router.get('/:id', authenticateToken, purchaseOrderController.getPurchaseOrder);

// Manager and Admin only routes
router.post('/', authenticateToken, requireManager, purchaseOrderController.createPurchaseOrder);
router.put('/:id', authenticateToken, requireManager, purchaseOrderController.updatePurchaseOrder);
router.put('/:id/status', authenticateToken, requireManager, purchaseOrderController.updatePurchaseOrderStatus);

// Admin only routes
router.delete('/:id', authenticateToken, requireAdmin, purchaseOrderController.deletePurchaseOrder);

export default router; 