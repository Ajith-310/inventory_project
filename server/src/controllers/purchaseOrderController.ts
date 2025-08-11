import { Request, Response } from 'express';
import { Like, ILike } from 'typeorm';
import { AppDataSource } from '../config/database';
import { PurchaseOrder } from '../models/PurchaseOrder';
import { PurchaseOrderItem } from '../models/PurchaseOrderItem';
import { Supplier } from '../models/Supplier';
import { Product } from '../models/Product';

export class PurchaseOrderController {
  // Get all purchase orders with pagination and search
  async getPurchaseOrders(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search, supplier_id, status, start_date, end_date } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const purchaseOrderRepository = AppDataSource.getRepository(PurchaseOrder);
      const queryBuilder = purchaseOrderRepository
        .createQueryBuilder('purchaseOrder')
        .leftJoinAndSelect('purchaseOrder.supplier', 'supplier')
        .leftJoinAndSelect('purchaseOrder.items', 'items')
        .leftJoinAndSelect('items.product', 'product');

      // Add search filter
      if (search) {
        queryBuilder.where(
          '(purchaseOrder.po_number ILIKE :search OR supplier.name ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Add supplier filter
      if (supplier_id) {
        queryBuilder.andWhere('purchaseOrder.supplier_id = :supplier_id', { supplier_id });
      }

      // Add status filter
      if (status) {
        queryBuilder.andWhere('purchaseOrder.status = :status', { status });
      }

      // Add date range filter
      if (start_date) {
        queryBuilder.andWhere('purchaseOrder.order_date >= :start_date', { start_date });
      }

      if (end_date) {
        queryBuilder.andWhere('purchaseOrder.order_date <= :end_date', { end_date });
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Get paginated results
      const purchaseOrders = await queryBuilder
        .orderBy('purchaseOrder.created_at', 'DESC')
        .skip(skip)
        .take(Number(limit))
        .getMany();

      res.status(200).json({
        message: 'Purchase orders retrieved successfully',
        data: {
          data: purchaseOrders,
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error getting purchase orders:', error);
      res.status(500).json({
        error: 'Failed to retrieve purchase orders'
      });
    }
  }

  // Get a single purchase order by ID
  async getPurchaseOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const purchaseOrderRepository = AppDataSource.getRepository(PurchaseOrder);

      const purchaseOrder = await purchaseOrderRepository.findOne({
        where: { id },
        relations: ['supplier', 'items', 'items.product']
      });

      if (!purchaseOrder) {
        return res.status(404).json({
          error: 'Purchase order not found'
        });
      }

      res.status(200).json({
        message: 'Purchase order retrieved successfully',
        data: purchaseOrder
      });
    } catch (error) {
      console.error('Error getting purchase order:', error);
      res.status(500).json({
        error: 'Failed to retrieve purchase order'
      });
    }
  }

  // Create a new purchase order
  async createPurchaseOrder(req: Request, res: Response) {
    try {
      const { 
        supplier_id, 
        order_date, 
        expected_delivery_date, 
        status = 'pending',
        items 
      } = req.body;

      const purchaseOrderRepository = AppDataSource.getRepository(PurchaseOrder);
      const supplierRepository = AppDataSource.getRepository(Supplier);
      const productRepository = AppDataSource.getRepository(Product);

      // Check if supplier exists
      const supplier = await supplierRepository.findOne({
        where: { id: supplier_id }
      });

      if (!supplier) {
        return res.status(400).json({
          error: 'Supplier not found'
        });
      }

      // Validate items
      if (!items || items.length === 0) {
        return res.status(400).json({
          error: 'Purchase order must have at least one item'
        });
      }

      // Check if all products exist
      for (const item of items) {
        const product = await productRepository.findOne({
          where: { id: item.product_id }
        });

        if (!product) {
          return res.status(400).json({
            error: `Product with ID ${item.product_id} not found`
          });
        }
      }

      // Generate PO number
      const poNumber = `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const purchaseOrder = purchaseOrderRepository.create({
        po_number: poNumber,
        supplier_id,
        order_date: order_date || new Date(),
        expected_delivery_date,
        status,
        created_by: (req as any).user.id,
        items: items.map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price
        }))
      });

      const savedPurchaseOrder = await purchaseOrderRepository.save(purchaseOrder);

      // Get the saved purchase order with relations
      const savedPOWithRelations = await purchaseOrderRepository.findOne({
        where: { id: savedPurchaseOrder.id },
        relations: ['supplier', 'items', 'items.product']
      });

      res.status(201).json({
        message: 'Purchase order created successfully',
        data: savedPOWithRelations
      });
    } catch (error) {
      console.error('Error creating purchase order:', error);
      res.status(500).json({
        error: 'Failed to create purchase order'
      });
    }
  }

  // Update a purchase order
  async updatePurchaseOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { 
        supplier_id, 
        order_date, 
        expected_delivery_date, 
        status,
        items 
      } = req.body;

      const purchaseOrderRepository = AppDataSource.getRepository(PurchaseOrder);
      const supplierRepository = AppDataSource.getRepository(Supplier);

      const purchaseOrder = await purchaseOrderRepository.findOne({
        where: { id },
        relations: ['supplier', 'items', 'items.product']
      });

      if (!purchaseOrder) {
        return res.status(404).json({
          error: 'Purchase order not found'
        });
      }

      // Check if PO can be updated (not received or cancelled)
      if (purchaseOrder.status === 'received' || purchaseOrder.status === 'cancelled') {
        return res.status(400).json({
          error: 'Cannot update purchase order that is delivered or cancelled'
        });
      }

      // Check if supplier exists (if being updated)
      if (supplier_id) {
        const supplier = await supplierRepository.findOne({
          where: { id: supplier_id }
        });

        if (!supplier) {
          return res.status(400).json({
            error: 'Supplier not found'
          });
        }
      }

      // Update purchase order
      Object.assign(purchaseOrder, {
        supplier_id: supplier_id || purchaseOrder.supplier_id,
        order_date: order_date || purchaseOrder.order_date,
        expected_delivery_date: expected_delivery_date || purchaseOrder.expected_delivery_date,
        status: status || purchaseOrder.status,
        // No notes field in the model
      });

      // Update items if provided
      if (items) {
        // Remove existing items
        await AppDataSource.getRepository(PurchaseOrderItem).delete({
          purchase_order_id: id
        });

        // Add new items
        purchaseOrder.items = items.map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price
        }));
      }

      const updatedPurchaseOrder = await purchaseOrderRepository.save(purchaseOrder);

      res.status(200).json({
        message: 'Purchase order updated successfully',
        data: updatedPurchaseOrder
      });
    } catch (error) {
      console.error('Error updating purchase order:', error);
      res.status(500).json({
        error: 'Failed to update purchase order'
      });
    }
  }

  // Delete a purchase order
  async deletePurchaseOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const purchaseOrderRepository = AppDataSource.getRepository(PurchaseOrder);

      const purchaseOrder = await purchaseOrderRepository.findOne({
        where: { id }
      });

      if (!purchaseOrder) {
        return res.status(404).json({
          error: 'Purchase order not found'
        });
      }

      // Check if PO can be deleted (only pending or draft)
      if (purchaseOrder.status !== 'pending' && purchaseOrder.status !== 'draft') {
        return res.status(400).json({
          error: 'Cannot delete purchase order that is not pending or draft'
        });
      }

      await purchaseOrderRepository.remove(purchaseOrder);

      res.status(200).json({
        message: 'Purchase order deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      res.status(500).json({
        error: 'Failed to delete purchase order'
      });
    }
  }

  // Update purchase order status
  async updatePurchaseOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const purchaseOrderRepository = AppDataSource.getRepository(PurchaseOrder);

      const purchaseOrder = await purchaseOrderRepository.findOne({
        where: { id }
      });

      if (!purchaseOrder) {
        return res.status(404).json({
          error: 'Purchase order not found'
        });
      }

      // Validate status transition
      const validTransitions: { [key: string]: string[] } = {
        'pending': ['approved', 'cancelled'],
        'approved': ['ordered', 'cancelled'],
        'ordered': ['shipped', 'cancelled'],
        'shipped': ['delivered'],
        'delivered': [],
        'cancelled': []
      };

      const allowedTransitions = validTransitions[purchaseOrder.status] || [];
      if (!allowedTransitions.includes(status)) {
        return res.status(400).json({
          error: `Invalid status transition from ${purchaseOrder.status} to ${status}`
        });
      }

      purchaseOrder.status = status;
      const updatedPurchaseOrder = await purchaseOrderRepository.save(purchaseOrder);

      res.status(200).json({
        message: 'Purchase order status updated successfully',
        data: updatedPurchaseOrder
      });
    } catch (error) {
      console.error('Error updating purchase order status:', error);
      res.status(500).json({
        error: 'Failed to update purchase order status'
      });
    }
  }

  // Search purchase orders
  async searchPurchaseOrders(req: Request, res: Response) {
    try {
      const { q, limit = 10 } = req.query;

      if (!q) {
        return res.status(400).json({
          error: 'Search query is required'
        });
      }

      const purchaseOrderRepository = AppDataSource.getRepository(PurchaseOrder);

      const purchaseOrders = await purchaseOrderRepository.find({
        where: [
          { po_number: ILike(`%${q}%`) },
          { supplier: { name: ILike(`%${q}%`) } }
        ],
        relations: ['supplier', 'items'],
        take: Number(limit),
        order: { created_at: 'DESC' }
      });

      res.status(200).json({
        message: 'Purchase orders search completed',
        data: purchaseOrders
      });
    } catch (error) {
      console.error('Error searching purchase orders:', error);
      res.status(500).json({
        error: 'Failed to search purchase orders'
      });
    }
  }

  // Get purchase order statistics
  async getPurchaseOrderStats(req: Request, res: Response) {
    try {
      const purchaseOrderRepository = AppDataSource.getRepository(PurchaseOrder);

      const stats = await purchaseOrderRepository
        .createQueryBuilder('po')
        .select([
          'po.status as status',
          'COUNT(po.id) as count',
          'SUM(po.total_amount) as total_amount'
        ])
        .groupBy('po.status')
        .getRawMany();

      res.status(200).json({
        message: 'Purchase order statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('Error getting purchase order stats:', error);
      res.status(500).json({
        error: 'Failed to retrieve purchase order statistics'
      });
    }
  }
} 