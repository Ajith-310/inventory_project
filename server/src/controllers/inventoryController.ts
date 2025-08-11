import { Request, Response } from 'express';
import { Like, ILike } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Inventory } from '../models/Inventory';
import { Product } from '../models/Product';
import { Warehouse } from '../models/Warehouse';

export class InventoryController {
  // Get all inventory items with pagination and search
  async getInventory(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search, warehouse_id, product_id, low_stock } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const inventoryRepository = AppDataSource.getRepository(Inventory);
      const queryBuilder = inventoryRepository
        .createQueryBuilder('inventory')
        .leftJoinAndSelect('inventory.product', 'product')
        .leftJoinAndSelect('inventory.warehouse', 'warehouse');

      // Add search filter
      if (search) {
        queryBuilder.where(
          '(product.name ILIKE :search OR product.sku ILIKE :search OR warehouse.name ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Add warehouse filter
      if (warehouse_id) {
        queryBuilder.andWhere('inventory.warehouse_id = :warehouse_id', { warehouse_id });
      }

      // Add product filter
      if (product_id) {
        queryBuilder.andWhere('inventory.product_id = :product_id', { product_id });
      }

      // Add low stock filter
      if (low_stock === 'true') {
        queryBuilder.andWhere('inventory.quantity <= product.reorder_point');
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Get paginated results
      const inventoryItems = await queryBuilder
        .orderBy('inventory.created_at', 'DESC')
        .skip(skip)
        .take(Number(limit))
        .getMany();

      res.status(200).json({
        message: 'Inventory items retrieved successfully',
        data: {
          data: inventoryItems,
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error getting inventory:', error);
      res.status(500).json({
        error: 'Failed to retrieve inventory'
      });
    }
  }

  // Get a single inventory item by ID
  async getInventoryItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const inventoryRepository = AppDataSource.getRepository(Inventory);

      const inventoryItem = await inventoryRepository.findOne({
        where: { id },
        relations: ['product', 'warehouse']
      });

      if (!inventoryItem) {
        return res.status(404).json({
          error: 'Inventory item not found'
        });
      }

      res.status(200).json({
        message: 'Inventory item retrieved successfully',
        data: inventoryItem
      });
    } catch (error) {
      console.error('Error getting inventory item:', error);
      res.status(500).json({
        error: 'Failed to retrieve inventory item'
      });
    }
  }

  // Create a new inventory item
  async createInventoryItem(req: Request, res: Response) {
    try {
      const { product_id, warehouse_id, quantity, reserved_quantity } = req.body;

      const inventoryRepository = AppDataSource.getRepository(Inventory);
      const productRepository = AppDataSource.getRepository(Product);
      const warehouseRepository = AppDataSource.getRepository(Warehouse);

      // Check if product exists
      const product = await productRepository.findOne({
        where: { id: product_id }
      });

      if (!product) {
        return res.status(400).json({
          error: 'Product not found'
        });
      }

      // Check if warehouse exists
      const warehouse = await warehouseRepository.findOne({
        where: { id: warehouse_id }
      });

      if (!warehouse) {
        return res.status(400).json({
          error: 'Warehouse not found'
        });
      }

      // Check if inventory item already exists for this product in this warehouse
      const existingInventory = await inventoryRepository.findOne({
        where: { product_id, warehouse_id }
      });

      if (existingInventory) {
        return res.status(400).json({
          error: 'Inventory item already exists for this product in this warehouse'
        });
      }

      const inventoryItem = inventoryRepository.create({
        product_id,
        warehouse_id,
        quantity: quantity || 0,
        reserved_quantity: reserved_quantity || 0
      });

      const savedInventoryItem = await inventoryRepository.save(inventoryItem);

      // Get the saved item with relations
      const savedItemWithRelations = await inventoryRepository.findOne({
        where: { id: savedInventoryItem.id },
        relations: ['product', 'warehouse']
      });

      res.status(201).json({
        message: 'Inventory item created successfully',
        data: savedItemWithRelations
      });
    } catch (error) {
      console.error('Error creating inventory item:', error);
      res.status(500).json({
        error: 'Failed to create inventory item'
      });
    }
  }

  // Update an inventory item
  async updateInventoryItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { quantity, reserved_quantity } = req.body;

      const inventoryRepository = AppDataSource.getRepository(Inventory);

      const inventoryItem = await inventoryRepository.findOne({
        where: { id },
        relations: ['product', 'warehouse']
      });

      if (!inventoryItem) {
        return res.status(404).json({
          error: 'Inventory item not found'
        });
      }

      // Update inventory item
      Object.assign(inventoryItem, {
        quantity: quantity !== undefined ? quantity : inventoryItem.quantity,
        reserved_quantity: reserved_quantity !== undefined ? reserved_quantity : inventoryItem.reserved_quantity
      });

      const updatedInventoryItem = await inventoryRepository.save(inventoryItem);

      res.status(200).json({
        message: 'Inventory item updated successfully',
        data: updatedInventoryItem
      });
    } catch (error) {
      console.error('Error updating inventory item:', error);
      res.status(500).json({
        error: 'Failed to update inventory item'
      });
    }
  }

  // Delete an inventory item
  async deleteInventoryItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const inventoryRepository = AppDataSource.getRepository(Inventory);

      const inventoryItem = await inventoryRepository.findOne({
        where: { id }
      });

      if (!inventoryItem) {
        return res.status(404).json({
          error: 'Inventory item not found'
        });
      }

      // Check if inventory has quantity
      if (inventoryItem.quantity > 0) {
        return res.status(400).json({
          error: 'Cannot delete inventory item with existing stock'
        });
      }

      await inventoryRepository.remove(inventoryItem);

      res.status(200).json({
        message: 'Inventory item deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      res.status(500).json({
        error: 'Failed to delete inventory item'
      });
    }
  }

  // Search inventory items
  async searchInventory(req: Request, res: Response) {
    try {
      const { q, limit = 10 } = req.query;

      if (!q) {
        return res.status(400).json({
          error: 'Search query is required'
        });
      }

      const inventoryRepository = AppDataSource.getRepository(Inventory);

      const inventoryItems = await inventoryRepository.find({
        where: [
          { product: { name: ILike(`%${q}%`) } },
          { product: { sku: ILike(`%${q}%`) } },
          { warehouse: { name: ILike(`%${q}%`) } }
        ],
        relations: ['product', 'warehouse'],
        take: Number(limit),
        order: { created_at: 'DESC' }
      });

      res.status(200).json({
        message: 'Inventory search completed',
        data: inventoryItems
      });
    } catch (error) {
      console.error('Error searching inventory:', error);
      res.status(500).json({
        error: 'Failed to search inventory'
      });
    }
  }

  // Get low stock items
  async getLowStockItems(req: Request, res: Response) {
    try {
      const inventoryRepository = AppDataSource.getRepository(Inventory);

      const lowStockItems = await inventoryRepository
        .createQueryBuilder('inventory')
        .leftJoinAndSelect('inventory.product', 'product')
        .leftJoinAndSelect('inventory.warehouse', 'warehouse')
        .where('inventory.quantity <= product.reorder_point')
        .andWhere('inventory.quantity > 0')
        .orderBy('inventory.quantity', 'ASC')
        .getMany();

      res.status(200).json({
        message: 'Low stock items retrieved successfully',
        data: lowStockItems
      });
    } catch (error) {
      console.error('Error getting low stock items:', error);
      res.status(500).json({
        error: 'Failed to retrieve low stock items'
      });
    }
  }

  // Get inventory summary by warehouse
  async getInventorySummary(req: Request, res: Response) {
    try {
      const inventoryRepository = AppDataSource.getRepository(Inventory);

      const summary = await inventoryRepository
        .createQueryBuilder('inventory')
        .leftJoin('inventory.warehouse', 'warehouse')
        .leftJoin('inventory.product', 'product')
        .select([
          'warehouse.name as warehouse_name',
          'warehouse.id as warehouse_id',
          'COUNT(inventory.id) as total_items',
          'SUM(inventory.quantity) as total_quantity',
          'SUM(CASE WHEN inventory.quantity <= product.reorder_point THEN 1 ELSE 0 END) as low_stock_items'
        ])
        .groupBy('warehouse.id, warehouse.name')
        .getRawMany();

      res.status(200).json({
        message: 'Inventory summary retrieved successfully',
        data: summary
      });
    } catch (error) {
      console.error('Error getting inventory summary:', error);
      res.status(500).json({
        error: 'Failed to retrieve inventory summary'
      });
    }
  }
} 