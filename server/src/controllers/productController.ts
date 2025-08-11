import { Request, Response } from 'express';
import { Like, ILike } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { Supplier } from '../models/Supplier';

export class ProductController {
  // Get all products with pagination and search
  async getProducts(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search, category_id, supplier_id, is_active } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const productRepository = AppDataSource.getRepository(Product);
      const queryBuilder = productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .leftJoinAndSelect('product.supplier', 'supplier');

      // Add search filter
      if (search) {
        queryBuilder.where(
          '(product.name ILIKE :search OR product.sku ILIKE :search OR product.description ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Add category filter
      if (category_id) {
        queryBuilder.andWhere('product.category_id = :category_id', { category_id });
      }

      // Add supplier filter
      if (supplier_id) {
        queryBuilder.andWhere('product.supplier_id = :supplier_id', { supplier_id });
      }

      // Add active status filter
      if (is_active !== undefined) {
        queryBuilder.andWhere('product.is_active = :is_active', { is_active: is_active === 'true' });
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Get paginated results
      const products = await queryBuilder
        .orderBy('product.created_at', 'DESC')
        .skip(skip)
        .take(Number(limit))
        .getMany();

      res.status(200).json({
        message: 'Products retrieved successfully',
        data: {
          data: products,
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error getting products:', error);
      res.status(500).json({
        error: 'Failed to retrieve products'
      });
    }
  }

  // Get a single product by ID
  async getProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const productRepository = AppDataSource.getRepository(Product);

      const product = await productRepository.findOne({
        where: { id },
        relations: ['category', 'supplier']
      });

      if (!product) {
        return res.status(404).json({
          error: 'Product not found'
        });
      }

      res.status(200).json({
        message: 'Product retrieved successfully',
        data: product
      });
    } catch (error) {
      console.error('Error getting product:', error);
      res.status(500).json({
        error: 'Failed to retrieve product'
      });
    }
  }

  // Create a new product
  async createProduct(req: Request, res: Response) {
    try {
      const {
        sku,
        name,
        description,
        category_id,
        supplier_id,
        unit_price,
        reorder_point,
        max_stock,
        is_active = true
      } = req.body;

      const productRepository = AppDataSource.getRepository(Product);

      // Check if SKU already exists
      const existingProduct = await productRepository.findOne({ where: { sku } });
      if (existingProduct) {
        return res.status(400).json({
          error: 'Product with this SKU already exists'
        });
      }

      // Validate category if provided
      if (category_id) {
        const categoryRepository = AppDataSource.getRepository(Category);
        const category = await categoryRepository.findOne({ where: { id: category_id } });
        if (!category) {
          return res.status(400).json({
            error: 'Category not found'
          });
        }
      }

      // Validate supplier if provided
      if (supplier_id) {
        const supplierRepository = AppDataSource.getRepository(Supplier);
        const supplier = await supplierRepository.findOne({ where: { id: supplier_id } });
        if (!supplier) {
          return res.status(400).json({
            error: 'Supplier not found'
          });
        }
      }

      const product = productRepository.create({
        sku,
        name,
        description,
        category_id,
        supplier_id,
        unit_price,
        reorder_point: reorder_point || 0,
        max_stock,
        is_active
      });

      const savedProduct = await productRepository.save(product);

      // Get the product with relations
      const productWithRelations = await productRepository.findOne({
        where: { id: savedProduct.id },
        relations: ['category', 'supplier']
      });

      res.status(201).json({
        message: 'Product created successfully',
        data: productWithRelations
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        error: 'Failed to create product'
      });
    }
  }

  // Update an existing product
  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const productRepository = AppDataSource.getRepository(Product);

      // Check if product exists
      const existingProduct = await productRepository.findOne({ where: { id } });
      if (!existingProduct) {
        return res.status(404).json({
          error: 'Product not found'
        });
      }

      // Check if SKU is being changed and if it already exists
      if (updateData.sku && updateData.sku !== existingProduct.sku) {
        const skuExists = await productRepository.findOne({ where: { sku: updateData.sku } });
        if (skuExists) {
          return res.status(400).json({
            error: 'Product with this SKU already exists'
          });
        }
      }

      // Validate category if provided
      if (updateData.category_id) {
        const categoryRepository = AppDataSource.getRepository(Category);
        const category = await categoryRepository.findOne({ where: { id: updateData.category_id } });
        if (!category) {
          return res.status(400).json({
            error: 'Category not found'
          });
        }
      }

      // Validate supplier if provided
      if (updateData.supplier_id) {
        const supplierRepository = AppDataSource.getRepository(Supplier);
        const supplier = await supplierRepository.findOne({ where: { id: updateData.supplier_id } });
        if (!supplier) {
          return res.status(400).json({
            error: 'Supplier not found'
          });
        }
      }

      // Update the product
      await productRepository.update(id, updateData);

      // Get the updated product with relations
      const updatedProduct = await productRepository.findOne({
        where: { id },
        relations: ['category', 'supplier']
      });

      res.status(200).json({
        message: 'Product updated successfully',
        data: updatedProduct
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({
        error: 'Failed to update product'
      });
    }
  }

  // Delete a product
  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const productRepository = AppDataSource.getRepository(Product);

      // Check if product exists
      const product = await productRepository.findOne({ where: { id } });
      if (!product) {
        return res.status(404).json({
          error: 'Product not found'
        });
      }

      // Soft delete by setting is_active to false
      await productRepository.update(id, { is_active: false });

      res.status(200).json({
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        error: 'Failed to delete product'
      });
    }
  }

  // Search products
  async searchProducts(req: Request, res: Response) {
    try {
      const { q, limit = 10 } = req.query;
      
      if (!q) {
        return res.status(400).json({
          error: 'Search query is required'
        });
      }

      const productRepository = AppDataSource.getRepository(Product);
      const products = await productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .leftJoinAndSelect('product.supplier', 'supplier')
        .where(
          '(product.name ILIKE :search OR product.sku ILIKE :search OR product.description ILIKE :search)',
          { search: `%${q}%` }
        )
        .andWhere('product.is_active = :is_active', { is_active: true })
        .orderBy('product.name', 'ASC')
        .take(Number(limit))
        .getMany();

      res.status(200).json({
        message: 'Products search completed',
        data: products
      });
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({
        error: 'Failed to search products'
      });
    }
  }
} 