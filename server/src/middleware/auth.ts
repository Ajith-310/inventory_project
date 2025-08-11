import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../models/User';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Middleware to verify JWT token
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Get user from database
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.userId, is_active: true }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid token - user not found' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
    } else {
      console.error('Auth middleware error:', error);
      res.status(500).json({ error: 'Authentication error' });
    }
  }
};

// Middleware to check if user has required role
export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
      return;
    }

    next();
  };
};

// Middleware to check if user is admin
export const requireAdmin = requireRole([UserRole.ADMIN]);

// Middleware to check if user is manager or admin
export const requireManager = requireRole([UserRole.ADMIN, UserRole.MANAGER]);

// Middleware to check if user is operator or higher
export const requireOperator = requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR]);

// Middleware to check if user is authenticated (any role)
export const requireAuth = requireRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.VIEWER]);

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: decoded.userId, is_active: true }
      });

      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Don't fail on token errors, just continue without user
    next();
  }
}; 