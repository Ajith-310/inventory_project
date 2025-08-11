# System Architecture Documentation

## 🏗️ High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Node.js API    │    │   PostgreSQL    │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│   Socket.io     │◄─────────────┘
                        │  (Real-time)    │
                        └─────────────────┘
```

## 📊 Database Schema Design

### Core Entities and Relationships

#### 1. Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'manager', 'operator', 'viewer') DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Categories Table
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. Suppliers Table
```sql
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    contact_person VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. Warehouses Table
```sql
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    capacity INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. Products Table
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    supplier_id UUID REFERENCES suppliers(id),
    unit_price DECIMAL(10,2),
    reorder_point INTEGER DEFAULT 0,
    max_stock INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. Inventory Table
```sql
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    warehouse_id UUID REFERENCES warehouses(id),
    quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, warehouse_id)
);
```

#### 7. Inventory Movements Table
```sql
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    warehouse_id UUID REFERENCES warehouses(id),
    movement_type ENUM('in', 'out', 'transfer', 'adjustment'),
    quantity INTEGER NOT NULL,
    reference_type ENUM('purchase_order', 'sale', 'transfer', 'adjustment'),
    reference_id UUID,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 8. Purchase Orders Table
```sql
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(100) UNIQUE NOT NULL,
    supplier_id UUID REFERENCES suppliers(id),
    status ENUM('draft', 'pending', 'approved', 'ordered', 'received', 'cancelled') DEFAULT 'draft',
    total_amount DECIMAL(10,2),
    order_date DATE,
    expected_delivery_date DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 9. Purchase Order Items Table
```sql
CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID REFERENCES purchase_orders(id),
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    received_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔄 API Endpoints Design

### Authentication Endpoints
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me
```

### User Management
```
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

### Product Management
```
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
GET    /api/products/:id/inventory
```

### Inventory Management
```
GET    /api/inventory
GET    /api/inventory/:productId
POST   /api/inventory/movement
GET    /api/inventory/alerts
PUT    /api/inventory/:id
```

### Purchase Orders
```
GET    /api/purchase-orders
GET    /api/purchase-orders/:id
POST   /api/purchase-orders
PUT    /api/purchase-orders/:id
DELETE /api/purchase-orders/:id
POST   /api/purchase-orders/:id/receive
```

### Suppliers
```
GET    /api/suppliers
GET    /api/suppliers/:id
POST   /api/suppliers
PUT    /api/suppliers/:id
DELETE /api/suppliers/:id
```

### Warehouses
```
GET    /api/warehouses
GET    /api/warehouses/:id
POST   /api/warehouses
PUT    /api/warehouses/:id
DELETE /api/warehouses/:id
```

### Categories
```
GET    /api/categories
GET    /api/categories/:id
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
```

### Dashboard & Reports
```
GET    /api/dashboard/summary
GET    /api/dashboard/stock-alerts
GET    /api/dashboard/low-stock
GET    /api/reports/inventory-turnover
GET    /api/reports/stock-valuation
GET    /api/reports/purchase-orders
```

## 🔐 Security Architecture

### Authentication Flow
1. User submits credentials
2. Server validates and returns JWT access token + refresh token
3. Client stores tokens securely
4. Access token used for API requests
5. Refresh token used to get new access token when expired

### Authorization Levels
- **Admin**: Full system access
- **Manager**: Inventory and purchase order management
- **Operator**: Basic inventory operations
- **Viewer**: Read-only access

### Data Protection
- Password hashing with bcrypt
- JWT token expiration
- Input validation and sanitization
- SQL injection prevention with TypeORM
- CORS configuration
- Rate limiting

## 📱 Frontend Architecture

### Component Structure
```
src/
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Loading.tsx
│   │   └── ErrorBoundary.tsx
│   ├── forms/
│   │   ├── ProductForm.tsx
│   │   ├── PurchaseOrderForm.tsx
│   │   └── InventoryForm.tsx
│   ├── tables/
│   │   ├── ProductTable.tsx
│   │   ├── InventoryTable.tsx
│   │   └── PurchaseOrderTable.tsx
│   └── dashboard/
│       ├── SummaryCards.tsx
│       ├── StockChart.tsx
│       └── AlertsList.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── Products.tsx
│   ├── Inventory.tsx
│   ├── PurchaseOrders.tsx
│   └── Reports.tsx
├── context/
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── services/
│   ├── api.ts
│   ├── auth.ts
│   └── socket.ts
└── utils/
    ├── constants.ts
    ├── helpers.ts
    └── validators.ts
```

### State Management
- React Context for global state (auth, theme)
- useReducer for complex state logic
- Local state for component-specific data
- React Query for server state management

## 🔄 Data Flow

### Inventory Movement Flow
1. User creates inventory movement
2. Frontend validates input
3. API receives request and validates
4. Database transaction updates inventory
5. Real-time notification sent to connected clients
6. Dashboard updates automatically

### Purchase Order Flow
1. Manager creates purchase order
2. Admin approves purchase order
3. Order sent to supplier
4. Goods received and inventory updated
5. Payment processed
6. Reports updated

## 📊 Performance Considerations

### Database Optimization
- Proper indexing on frequently queried columns
- Composite indexes for complex queries
- Query optimization with TypeORM
- Connection pooling

### Frontend Optimization
- Code splitting with React.lazy()
- Memoization with React.memo()
- Virtual scrolling for large tables
- Image optimization and lazy loading

### Caching Strategy
- Redis for session storage
- Browser caching for static assets
- API response caching
- Database query result caching

## 🔧 Development Environment

### Required Tools
- Node.js 18+
- PostgreSQL 14+
- Git
- VS Code (recommended)

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/inventory_db

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Server
PORT=5000
NODE_ENV=development

# Client
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 🚀 Deployment Architecture

### Production Setup
- Frontend: Vercel/Netlify
- Backend: AWS EC2/DigitalOcean
- Database: AWS RDS/Managed PostgreSQL
- File Storage: AWS S3
- CDN: CloudFront

### CI/CD Pipeline
1. Code push to main branch
2. Automated testing
3. Build process
4. Deployment to staging
5. Manual approval
6. Production deployment

## 📈 Scalability Considerations

### Horizontal Scaling
- Load balancer for multiple API instances
- Database read replicas
- CDN for static assets
- Microservices architecture (future)

### Vertical Scaling
- Database optimization
- Server resource upgrades
- Caching implementation
- Code optimization

This architecture provides a solid foundation for a scalable, maintainable inventory management system that can grow with business needs. 