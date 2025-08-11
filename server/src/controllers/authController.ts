import { Request, Response } from 'express';
import { AuthService, LoginCredentials, RegisterData } from '../services/authService';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export class AuthController {
  private authService = new AuthService();

  // User login
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password }: LoginCredentials = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const result = await this.authService.login({ email, password });

      res.status(200).json({
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ 
        error: error instanceof Error ? error.message : 'Login failed' 
      });
    }
  };

  // User registration
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const registerData: RegisterData = req.body;

      // Validate required fields
      if (!registerData.email || !registerData.password || 
          !registerData.first_name || !registerData.last_name) {
        res.status(400).json({ 
          error: 'Email, password, first name, and last name are required' 
        });
        return;
      }

      const result = await this.authService.register(registerData);

      res.status(201).json({
        message: 'Registration successful',
        data: result
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Registration failed' 
      });
    }
  };

  // Refresh access token
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token is required' });
        return;
      }

      const result = await this.authService.refreshToken(refreshToken);

      res.status(200).json({
        message: 'Token refreshed successfully',
        data: result
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({ 
        error: error instanceof Error ? error.message : 'Token refresh failed' 
      });
    }
  };

  // Get current user
  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const user = await this.authService.getCurrentUser(req.user.id);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({
        message: 'User retrieved successfully',
        data: user
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to get user' 
      });
    }
  };

  // Change password
  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'Current password and new password are required' });
        return;
      }

      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      await this.authService.changePassword(req.user.id, currentPassword, newPassword);

      res.status(200).json({
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Password change failed' 
      });
    }
  };

  // Update profile
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { first_name, last_name, email } = req.body;

      if (!req.user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const updateData: Partial<typeof req.user> = {};
      if (first_name) updateData.first_name = first_name;
      if (last_name) updateData.last_name = last_name;
      if (email) updateData.email = email;

      const updatedUser = await this.authService.updateProfile(req.user.id, updateData);

      res.status(200).json({
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Profile update failed' 
      });
    }
  };

  // Get all users (admin only)
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.authService.getAllUsers();

      res.status(200).json({
        message: 'Users retrieved successfully',
        data: users
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to get users' 
      });
    }
  };

  // Update user role (admin only)
  updateUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!role) {
        res.status(400).json({ error: 'Role is required' });
        return;
      }

      const updatedUser = await this.authService.updateUserRole(userId, role);

      res.status(200).json({
        message: 'User role updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Role update failed' 
      });
    }
  };

  // Deactivate user (admin only)
  deactivateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      await this.authService.deactivateUser(userId);

      res.status(200).json({
        message: 'User deactivated successfully'
      });
    } catch (error) {
      console.error('Deactivate user error:', error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'User deactivation failed' 
      });
    }
  };
} 