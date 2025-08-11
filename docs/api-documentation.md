# API Documentation - Inventory Management System

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this format:
```json
{
  "message": "Success message",
  "data": { ... },
  "error": "Error message (if applicable)"
}
```

---

## 🔐 Authentication Endpoints

### POST /auth/login
**Description**: Authenticate user and get access token

**Request Body**:
```json
{
  "email": "admin@inventory.com",
  "password": "admin123"
}
```

**Response**:
```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@inventory.com",
      "first_name": "Admin",
      "last_name": "User",
      "role": "admin",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresIn": 3600
  }
}
```

### POST /auth/register
**Description**: Register a new user

**Request Body**:
```json
{
  "email": "newuser@inventory.com",
  "password": "password123",
  "first_name": "New",
  "last_name": "User",
  "role": "viewer"
}
```

**Response**:
```json
{
  "message": "Registration successful",
  "data": {
    "user": { ... },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresIn": 3600
  }
}
```

### POST /auth/refresh
**Description**: Refresh access token using refresh token

**Request Body**:
```json
{
  "refreshToken": "refresh-token"
}
```

**Response**:
```json
{
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new-jwt-token",
    "expiresIn": 3600
  }
}
```

### GET /auth/me
**Description**: Get current user information
**Authentication**: Required

**Response**:
```json
{
  "message": "User retrieved successfully",
  "data": {
    "id": "uuid",
    "email": "admin@inventory.com",
    "first_name": "Admin",
    "last_name": "User",
    "role": "admin",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /auth/profile
**Description**: Update user profile
**Authentication**: Required

**Request Body**:
```json
{
  "first_name": "Updated",
  "last_name": "Name",
  "email": "updated@inventory.com"
}
```

### PUT /auth/change-password
**Description**: Change user password
**Authentication**: Required

**Request Body**:
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

### GET /auth/users
**Description**: Get all users (Admin only)
**Authentication**: Required
**Authorization**: Admin

**Response**:
```json
{
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "email": "admin@inventory.com",
      "first_name": "Admin",
      "last_name": "User",
      "role": "admin",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### PUT /auth/users/:userId/role
**Description**: Update user role (Admin only)
**Authentication**: Required
**Authorization**: Admin

**Request Body**:
```json
{
  "role": "manager"
}
```

### DELETE /auth/users/:userId
**Description**: Deactivate user (Admin only)
**Authentication**: Required
**Authorization**: Admin

---

## 📊 Health Check

### GET /health
**Description**: Check API health status

**Response**:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

---

## 🔧 Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions",
  "required": ["admin"],
  "current": "viewer"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 📋 User Roles

### Role Hierarchy
1. **Admin** - Full system access
2. **Manager** - Inventory and purchase order management
3. **Operator** - Basic inventory operations
4. **Viewer** - Read-only access

### Role Permissions

| Endpoint | Admin | Manager | Operator | Viewer |
|----------|-------|---------|----------|--------|
| GET /auth/me | ✅ | ✅ | ✅ | ✅ |
| PUT /auth/profile | ✅ | ✅ | ✅ | ✅ |
| PUT /auth/change-password | ✅ | ✅ | ✅ | ✅ |
| GET /auth/users | ✅ | ❌ | ❌ | ❌ |
| PUT /auth/users/:id/role | ✅ | ❌ | ❌ | ❌ |
| DELETE /auth/users/:id | ✅ | ❌ | ❌ | ❌ |

---

## 🚀 Getting Started

### 1. Setup Environment
```bash
cd server
npm run setup
```

### 2. Start Database
Make sure PostgreSQL is running and create the database:
```sql
CREATE DATABASE inventory_db;
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Start Server
```bash
npm run dev
```

### 5. Test Authentication
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@inventory.com", "password": "admin123"}'
```

---

## 📝 Development Notes

### JWT Token Structure
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "admin",
  "iat": 1640995200,
  "exp": 1640998800
}
```

### Database Schema
- **Users**: Authentication and authorization
- **Categories**: Product categorization
- **Suppliers**: Vendor management
- **Warehouses**: Multiple warehouse locations
- **Products**: Product catalog
- **Inventory**: Stock levels and movements
- **PurchaseOrders**: Supplier orders
- **PurchaseOrderItems**: Individual items in orders
- **InventoryMovements**: Audit trail for stock changes

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/inventory_db
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=inventory_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

---

## 🔄 Next Steps

This API documentation covers the authentication system. Additional endpoints for:
- Product management
- Inventory tracking
- Purchase orders
- Suppliers
- Warehouses
- Categories
- Dashboard and reports

Will be added as the backend development progresses. 