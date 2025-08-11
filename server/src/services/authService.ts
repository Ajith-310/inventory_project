import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../models/User';
import { JWTPayload } from '../middleware/auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: Partial<User>;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  // Generate JWT access token
  private generateAccessToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
    };

    return jwt.sign(payload, process.env.JWT_SECRET!);
  }

  // Generate JWT refresh token
  private generateRefreshToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      type: 'refresh'
    };

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: '7d'
    });
  }

  // User login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.is_active) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
      expiresIn: 3600 // 1 hour
    };
  }

  // User registration
  async register(data: RegisterData): Promise<AuthResponse> {
    const { email, password, first_name, last_name, role = UserRole.VIEWER } = data;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const user = this.userRepository.create({
      email: email.toLowerCase(),
      password_hash: password, // Will be hashed by entity hook
      first_name,
      last_name,
      role,
      is_active: true
    });

    const savedUser = await this.userRepository.save(user);

    // Generate tokens
    const accessToken = this.generateAccessToken(savedUser);
    const refreshToken = this.generateRefreshToken(savedUser);

    return {
      user: savedUser.toJSON(),
      accessToken,
      refreshToken,
      expiresIn: 3600
    };
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      const user = await this.userRepository.findOne({
        where: { id: decoded.userId, is_active: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const accessToken = this.generateAccessToken(user);

      return {
        accessToken,
        expiresIn: 3600
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Get current user
  async getCurrentUser(userId: string): Promise<Partial<User> | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true }
    });

    return user ? user.toJSON() : null;
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    user.password_hash = newPassword; // Will be hashed by entity hook
    await this.userRepository.save(user);
  }

  // Update user profile
  async updateProfile(userId: string, data: Partial<User>): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Update allowed fields
    if (data.first_name) user.first_name = data.first_name;
    if (data.last_name) user.last_name = data.last_name;
    if (data.email && data.email !== user.email) {
      // Check if new email is already taken
      const existingUser = await this.userRepository.findOne({
        where: { email: data.email.toLowerCase() }
      });
      if (existingUser) {
        throw new Error('Email is already taken');
      }
      user.email = data.email.toLowerCase();
    }

    const savedUser = await this.userRepository.save(user);
    return savedUser.toJSON();
  }

  // Deactivate user
  async deactivateUser(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    user.is_active = false;
    await this.userRepository.save(user);
  }

  // Get all users (admin only)
  async getAllUsers(): Promise<Partial<User>[]> {
    const users = await this.userRepository.find({
      order: { created_at: 'DESC' }
    });

    return users.map(user => user.toJSON());
  }

  // Update user role (admin only)
  async updateUserRole(userId: string, role: UserRole): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    user.role = role;
    const savedUser = await this.userRepository.save(user);
    return savedUser.toJSON();
  }
} 