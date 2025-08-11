import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { Supplier } from '../models/Supplier';
import { Warehouse } from '../models/Warehouse';

export class DashboardController {
  // Get dashboard statistics
  async getDashboardStats(req: Request, res: Response) {
    try {
      const productRepository = AppDataSource.getRepository(Product);
      const categoryRepository = AppDataSource.getRepository(Category);
      const supplierRepository = AppDataSource.getRepository(Supplier);
      const warehouseRepository = AppDataSource.getRepository(Warehouse);

      // Get counts
      const [
        totalProducts,
        totalCategories,
        totalSuppliers,
        totalWarehouses,
        lowStockItems,
        totalInventoryValue
      ] = await Promise.all([
        // Total active products
        productRepository.count({ where: { is_active: true } }),
        
        // Total categories
        categoryRepository.count(),
        
        // Total active suppliers
        supplierRepository.count({ where: { is_active: true } }),
        
        // Total warehouses
        warehouseRepository.count(),
        
        // Low stock items (products with quantity below reorder point)
        // For now, we'll count products with reorder_point > 0 as low stock items
        // This should be updated when inventory tracking is implemented
        productRepository.count({ 
          where: { 
            is_active: true,
            reorder_point: 0 // Placeholder - should check actual inventory levels
          } 
        }),
        
        // Total inventory value (placeholder - should calculate from actual inventory)
        // For now, we'll sum up all product prices
        productRepository
          .createQueryBuilder('product')
          .select('SUM(COALESCE(product.unit_price, 0))', 'total')
          .where('product.is_active = :is_active', { is_active: true })
          .getRawOne()
          .then(result => parseFloat(result?.total || '0'))
      ]);

      // Calculate total purchase orders (placeholder - should be implemented when PO system is ready)
      const totalPurchaseOrders = 0;

      const stats = {
        totalProducts,
        totalCategories,
        totalSuppliers,
        totalWarehouses,
        totalPurchaseOrders,
        lowStockItems,
        totalInventoryValue
      };

      res.status(200).json({
        message: 'Dashboard stats retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      res.status(500).json({
        error: 'Failed to retrieve dashboard stats'
      });
    }
  }
} 