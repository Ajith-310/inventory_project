import { Request, Response } from 'express';
import { Like, ILike } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Warehouse } from '../models/Warehouse';
import { Inventory } from '../models/Inventory';

export class WarehouseController {
  // Get all warehouses with pagination and search
  async getWarehouses(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search, is_active } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const warehouseRepository = AppDataSource.getRepository(Warehouse);
      const queryBuilder = warehouseRepository.createQueryBuilder('warehouse');

      // Add search filter
      if (search) {
        queryBuilder.where(
          '(warehouse.name ILIKE :search OR warehouse.address ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Add active status filter
      if (is_active !== undefined) {
        queryBuilder.andWhere('warehouse.is_active = :is_active', { is_active: is_active === 'true' });
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Get paginated results
      const warehouses = await queryBuilder
        .orderBy('warehouse.created_at', 'DESC')
        .skip(skip)
        .take(Number(limit))
        .getMany();

      res.status(200).json({
        message: 'Warehouses retrieved successfully',
        data: {
          data: warehouses,
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error getting warehouses:', error);
      res.status(500).json({
        error: 'Failed to retrieve warehouses'
      });
    }
  }

  // Get a single warehouse by ID
  async getWarehouse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const warehouseRepository = AppDataSource.getRepository(Warehouse);

      const warehouse = await warehouseRepository.findOne({
        where: { id }
      });

      if (!warehouse) {
        return res.status(404).json({
          error: 'Warehouse not found'
        });
      }

      res.status(200).json({
        message: 'Warehouse retrieved successfully',
        data: warehouse
      });
    } catch (error) {
      console.error('Error getting warehouse:', error);
      res.status(500).json({
        error: 'Failed to retrieve warehouse'
      });
    }
  }

  // Create a new warehouse
  async createWarehouse(req: Request, res: Response) {
    try {
      const { name, address, capacity, is_active = true } = req.body;

      const warehouseRepository = AppDataSource.getRepository(Warehouse);

      // Check if warehouse with same name already exists
      const existingWarehouse = await warehouseRepository.findOne({
        where: { name }
      });

      if (existingWarehouse) {
        return res.status(400).json({
          error: 'Warehouse with this name already exists'
        });
      }

      const warehouse = warehouseRepository.create({
        name,
        address,
        capacity,
        is_active
      });

      const savedWarehouse = await warehouseRepository.save(warehouse);

      res.status(201).json({
        message: 'Warehouse created successfully',
        data: savedWarehouse
      });
    } catch (error) {
      console.error('Error creating warehouse:', error);
      res.status(500).json({
        error: 'Failed to create warehouse'
      });
    }
  }

  // Update a warehouse
  async updateWarehouse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, address, capacity, is_active } = req.body;

      const warehouseRepository = AppDataSource.getRepository(Warehouse);

      const warehouse = await warehouseRepository.findOne({
        where: { id }
      });

      if (!warehouse) {
        return res.status(404).json({
          error: 'Warehouse not found'
        });
      }

      // Check if name is being changed and if it conflicts with existing warehouse
      if (name && name !== warehouse.name) {
        const existingWarehouse = await warehouseRepository.findOne({
          where: { name }
        });

        if (existingWarehouse) {
          return res.status(400).json({
            error: 'Warehouse with this name already exists'
          });
        }
      }

      // Update warehouse
      Object.assign(warehouse, {
        name: name || warehouse.name,
        address: address || warehouse.address,
        capacity: capacity !== undefined ? capacity : warehouse.capacity,
        is_active: is_active !== undefined ? is_active : warehouse.is_active
      });

      const updatedWarehouse = await warehouseRepository.save(warehouse);

      res.status(200).json({
        message: 'Warehouse updated successfully',
        data: updatedWarehouse
      });
    } catch (error) {
      console.error('Error updating warehouse:', error);
      res.status(500).json({
        error: 'Failed to update warehouse'
      });
    }
  }

  // Delete a warehouse (soft delete)
  async deleteWarehouse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const warehouseRepository = AppDataSource.getRepository(Warehouse);
      const inventoryRepository = AppDataSource.getRepository(Inventory);

      const warehouse = await warehouseRepository.findOne({
        where: { id }
      });

      if (!warehouse) {
        return res.status(404).json({
          error: 'Warehouse not found'
        });
      }

      // Check if warehouse has inventory items
      const inventoryCount = await inventoryRepository.count({
        where: { warehouse_id: id }
      });

      if (inventoryCount > 0) {
        return res.status(400).json({
          error: 'Cannot delete warehouse with existing inventory items'
        });
      }

      // Soft delete by setting is_active to false
      warehouse.is_active = false;
      await warehouseRepository.save(warehouse);

      res.status(200).json({
        message: 'Warehouse deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      res.status(500).json({
        error: 'Failed to delete warehouse'
      });
    }
  }

  // Search warehouses
  async searchWarehouses(req: Request, res: Response) {
    try {
      const { q, limit = 10 } = req.query;

      if (!q) {
        return res.status(400).json({
          error: 'Search query is required'
        });
      }

      const warehouseRepository = AppDataSource.getRepository(Warehouse);

      const warehouses = await warehouseRepository.find({
        where: [
          { name: ILike(`%${q}%`) },
          { address: ILike(`%${q}%`) }
        ],
        take: Number(limit),
        order: { name: 'ASC' }
      });

      res.status(200).json({
        message: 'Warehouses search completed',
        data: warehouses
      });
    } catch (error) {
      console.error('Error searching warehouses:', error);
      res.status(500).json({
        error: 'Failed to search warehouses'
      });
    }
  }
} 