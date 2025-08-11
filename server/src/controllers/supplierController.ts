import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Supplier } from '../models/Supplier';

export class SupplierController {
  // Get all suppliers
  async getSuppliers(req: Request, res: Response) {
    try {
      const supplierRepository = AppDataSource.getRepository(Supplier);
      const suppliers = await supplierRepository.find({
        order: { name: 'ASC' }
      });

      res.status(200).json({
        message: 'Suppliers retrieved successfully',
        data: suppliers
      });
    } catch (error) {
      console.error('Error getting suppliers:', error);
      res.status(500).json({
        error: 'Failed to retrieve suppliers'
      });
    }
  }

  // Get a single supplier by ID
  async getSupplier(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const supplierRepository = AppDataSource.getRepository(Supplier);

      const supplier = await supplierRepository.findOne({
        where: { id }
      });

      if (!supplier) {
        return res.status(404).json({
          error: 'Supplier not found'
        });
      }

      res.status(200).json({
        message: 'Supplier retrieved successfully',
        data: supplier
      });
    } catch (error) {
      console.error('Error getting supplier:', error);
      res.status(500).json({
        error: 'Failed to retrieve supplier'
      });
    }
  }

  // Create a new supplier
  async createSupplier(req: Request, res: Response) {
    try {
      const { name, email, phone, address, contact_person, is_active = true } = req.body;
      const supplierRepository = AppDataSource.getRepository(Supplier);

      // Check if supplier email already exists
      const existingSupplier = await supplierRepository.findOne({ where: { email } });
      if (existingSupplier) {
        return res.status(400).json({
          error: 'Supplier with this email already exists'
        });
      }

      const supplier = supplierRepository.create({
        name,
        email,
        phone,
        address,
        contact_person,
        is_active
      });

      const savedSupplier = await supplierRepository.save(supplier);

      res.status(201).json({
        message: 'Supplier created successfully',
        data: savedSupplier
      });
    } catch (error) {
      console.error('Error creating supplier:', error);
      res.status(500).json({
        error: 'Failed to create supplier'
      });
    }
  }

  // Update an existing supplier
  async updateSupplier(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const supplierRepository = AppDataSource.getRepository(Supplier);

      // Check if supplier exists
      const existingSupplier = await supplierRepository.findOne({ where: { id } });
      if (!existingSupplier) {
        return res.status(404).json({
          error: 'Supplier not found'
        });
      }

      // Check if email is being changed and if it already exists
      if (updateData.email && updateData.email !== existingSupplier.email) {
        const emailExists = await supplierRepository.findOne({ where: { email: updateData.email } });
        if (emailExists) {
          return res.status(400).json({
            error: 'Supplier with this email already exists'
          });
        }
      }

      // Update the supplier
      await supplierRepository.update(id, updateData);

      // Get the updated supplier
      const updatedSupplier = await supplierRepository.findOne({ where: { id } });

      res.status(200).json({
        message: 'Supplier updated successfully',
        data: updatedSupplier
      });
    } catch (error) {
      console.error('Error updating supplier:', error);
      res.status(500).json({
        error: 'Failed to update supplier'
      });
    }
  }

  // Delete a supplier
  async deleteSupplier(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const supplierRepository = AppDataSource.getRepository(Supplier);

      // Check if supplier exists
      const supplier = await supplierRepository.findOne({ where: { id } });
      if (!supplier) {
        return res.status(404).json({
          error: 'Supplier not found'
        });
      }

      // Soft delete by setting is_active to false
      await supplierRepository.update(id, { is_active: false });

      res.status(200).json({
        message: 'Supplier deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting supplier:', error);
      res.status(500).json({
        error: 'Failed to delete supplier'
      });
    }
  }
} 