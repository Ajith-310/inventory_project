import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Category } from '../models/Category';

export class CategoryController {
  // Get all categories
  async getCategories(req: Request, res: Response) {
    try {
      const categoryRepository = AppDataSource.getRepository(Category);
      const categories = await categoryRepository.find({
        order: { name: 'ASC' }
      });

      res.status(200).json({
        message: 'Categories retrieved successfully',
        data: categories
      });
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({
        error: 'Failed to retrieve categories'
      });
    }
  }

  // Get a single category by ID
  async getCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const categoryRepository = AppDataSource.getRepository(Category);

      const category = await categoryRepository.findOne({
        where: { id }
      });

      if (!category) {
        return res.status(404).json({
          error: 'Category not found'
        });
      }

      res.status(200).json({
        message: 'Category retrieved successfully',
        data: category
      });
    } catch (error) {
      console.error('Error getting category:', error);
      res.status(500).json({
        error: 'Failed to retrieve category'
      });
    }
  }

  // Create a new category
  async createCategory(req: Request, res: Response) {
    try {
      const { name, description, parent_id } = req.body;
      const categoryRepository = AppDataSource.getRepository(Category);

      // Check if category name already exists
      const existingCategory = await categoryRepository.findOne({ where: { name } });
      if (existingCategory) {
        return res.status(400).json({
          error: 'Category with this name already exists'
        });
      }

      // Validate parent category if provided
      if (parent_id) {
        const parentCategory = await categoryRepository.findOne({ where: { id: parent_id } });
        if (!parentCategory) {
          return res.status(400).json({
            error: 'Parent category not found'
          });
        }
      }

      const category = categoryRepository.create({
        name,
        description,
        parent_id
      });

      const savedCategory = await categoryRepository.save(category);

      res.status(201).json({
        message: 'Category created successfully',
        data: savedCategory
      });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({
        error: 'Failed to create category'
      });
    }
  }

  // Update an existing category
  async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const categoryRepository = AppDataSource.getRepository(Category);

      // Check if category exists
      const existingCategory = await categoryRepository.findOne({ where: { id } });
      if (!existingCategory) {
        return res.status(404).json({
          error: 'Category not found'
        });
      }

      // Check if name is being changed and if it already exists
      if (updateData.name && updateData.name !== existingCategory.name) {
        const nameExists = await categoryRepository.findOne({ where: { name: updateData.name } });
        if (nameExists) {
          return res.status(400).json({
            error: 'Category with this name already exists'
          });
        }
      }

      // Validate parent category if provided
      if (updateData.parent_id) {
        const parentCategory = await categoryRepository.findOne({ where: { id: updateData.parent_id } });
        if (!parentCategory) {
          return res.status(400).json({
            error: 'Parent category not found'
          });
        }
      }

      // Update the category
      await categoryRepository.update(id, updateData);

      // Get the updated category
      const updatedCategory = await categoryRepository.findOne({ where: { id } });

      res.status(200).json({
        message: 'Category updated successfully',
        data: updatedCategory
      });
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({
        error: 'Failed to update category'
      });
    }
  }

  // Delete a category
  async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const categoryRepository = AppDataSource.getRepository(Category);

      // Check if category exists
      const category = await categoryRepository.findOne({ where: { id } });
      if (!category) {
        return res.status(404).json({
          error: 'Category not found'
        });
      }

      // Check if category has children
      const hasChildren = await categoryRepository.findOne({ where: { parent_id: id } });
      if (hasChildren) {
        return res.status(400).json({
          error: 'Cannot delete category with subcategories'
        });
      }

      await categoryRepository.delete(id);

      res.status(200).json({
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({
        error: 'Failed to delete category'
      });
    }
  }
} 