// User types
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  VIEWER = 'viewer'
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  parent?: Category;
  children?: Category[];
  created_at: string;
  updated_at: string;
}

// Supplier types
export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contact_person: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Warehouse types
export interface Warehouse {
  id: string;
  name: string;
  address: string;
  capacity?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Product types
export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category_id: string;
  category: Category;
  supplier_id: string;
  supplier: Supplier;
  unit_price: number;
  reorder_point: number;
  max_stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Warehouse form data
export interface WarehouseFormData {
  name: string;
  address: string;
  capacity?: number;
  is_active: boolean;
}

// Inventory types
export interface Inventory {
  id: string;
  product_id: string;
  product: Product;
  warehouse_id: string;
  warehouse: Warehouse;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  created_at: string;
  updated_at: string;
}

// Inventory Movement types
export enum MovementType {
  IN = 'in',
  OUT = 'out',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment'
}

export enum ReferenceType {
  PURCHASE_ORDER = 'purchase_order',
  SALE = 'sale',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment'
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  product: Product;
  warehouse_id: string;
  warehouse: Warehouse;
  movement_type: MovementType;
  quantity: number;
  reference_type: ReferenceType;
  reference_id: string;
  notes?: string;
  created_by: string;
  user: User;
  created_at: string;
}

// Purchase Order types
export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  ORDERED = 'ordered',
  PARTIALLY_RECEIVED = 'partially_received',
  RECEIVED = 'received',
  CANCELLED = 'cancelled'
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  supplier: Supplier;
  status: PurchaseOrderStatus;
  total_amount: number;
  order_date: string;
  expected_delivery_date: string;
  actual_delivery_date?: string;
  notes?: string;
  created_by: string;
  user: User;
  created_at: string;
  updated_at: string;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  product: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
  received_quantity: number;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard types
export interface DashboardStats {
  totalProducts: number;
  totalWarehouses: number;
  totalSuppliers: number;
  totalPurchaseOrders: number;
  lowStockItems: number;
  totalInventoryValue: number;
}

export interface ChartData {
  name: string;
  value: number;
}

// Form types
export interface ProductFormData {
  sku: string;
  name: string;
  description?: string;
  category_id: string;
  supplier_id: string;
  unit_price: number;
  reorder_point: number;
  max_stock: number;
  is_active?: boolean;
}

export interface InventoryFormData {
  product_id: string;
  warehouse_id: string;
  quantity: number;
  reserved_quantity: number;
}

export interface PurchaseOrderFormData {
  supplier_id: string;
  expected_delivery_date: string;
  notes?: string;
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
} 