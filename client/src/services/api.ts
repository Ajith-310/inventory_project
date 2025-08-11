import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  LoginCredentials, 
  AuthResponse, 
  Product, 
  Category, 
  Supplier, 
  Warehouse, 
  Inventory, 
  PurchaseOrder,
  PurchaseOrderFormData,
  ProductFormData,
  InventoryFormData,
  DashboardStats,
  PaginatedResponse,
  ApiResponse
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post('/api/auth/refresh', {
                refreshToken,
              });
              
              const { accessToken } = response.data.data;
              localStorage.setItem('accessToken', accessToken);
              
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post('/auth/login', credentials);
    return response.data.data;
  }

  async register(userData: Partial<User> & { password: string }): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post('/auth/register', userData);
    return response.data.data;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post('/auth/refresh', { refreshToken });
    return response.data.data;
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/auth/me');
    return response.data.data;
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.put('/auth/profile', userData);
    return response.data.data;
  }

  async changePassword(passwords: { currentPassword: string; newPassword: string }): Promise<void> {
    await this.api.put('/auth/change-password', passwords);
  }

  // User management (Admin only)
  async getAllUsers(): Promise<User[]> {
    const response: AxiosResponse<ApiResponse<User[]>> = await this.api.get('/auth/users');
    return response.data.data;
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.put(`/auth/users/${userId}/role`, { role });
    return response.data.data;
  }

  async deactivateUser(userId: string): Promise<void> {
    await this.api.delete(`/auth/users/${userId}`);
  }

  // Dashboard methods
  async getDashboardStats(): Promise<DashboardStats> {
    const response: AxiosResponse<ApiResponse<DashboardStats>> = await this.api.get('/dashboard/stats');
    return response.data.data;
  }

  // Product methods
  async getProducts(page = 1, limit = 10, search?: string): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append('search', search);
    
    const response: AxiosResponse<ApiResponse<PaginatedResponse<Product>>> = await this.api.get(`/products?${params}`);
    return response.data.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response: AxiosResponse<ApiResponse<Product>> = await this.api.get(`/products/${id}`);
    return response.data.data;
  }

  async createProduct(productData: ProductFormData): Promise<Product> {
    const response: AxiosResponse<ApiResponse<Product>> = await this.api.post('/products', productData);
    return response.data.data;
  }

  async updateProduct(id: string, productData: Partial<ProductFormData>): Promise<Product> {
    const response: AxiosResponse<ApiResponse<Product>> = await this.api.put(`/products/${id}`, productData);
    return response.data.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.api.delete(`/products/${id}`);
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    const response: AxiosResponse<ApiResponse<Category[]>> = await this.api.get('/categories');
    return response.data.data;
  }

  async createCategory(categoryData: Partial<Category>): Promise<Category> {
    const response: AxiosResponse<ApiResponse<Category>> = await this.api.post('/categories', categoryData);
    return response.data.data;
  }

  async updateCategory(id: string, categoryData: Partial<Category>): Promise<Category> {
    const response: AxiosResponse<ApiResponse<Category>> = await this.api.put(`/categories/${id}`, categoryData);
    return response.data.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.api.delete(`/categories/${id}`);
  }

  // Supplier methods
  async getSuppliers(): Promise<Supplier[]> {
    const response: AxiosResponse<ApiResponse<Supplier[]>> = await this.api.get('/suppliers');
    return response.data.data;
  }

  async createSupplier(supplierData: Partial<Supplier>): Promise<Supplier> {
    const response: AxiosResponse<ApiResponse<Supplier>> = await this.api.post('/suppliers', supplierData);
    return response.data.data;
  }

  async updateSupplier(id: string, supplierData: Partial<Supplier>): Promise<Supplier> {
    const response: AxiosResponse<ApiResponse<Supplier>> = await this.api.put(`/suppliers/${id}`, supplierData);
    return response.data.data;
  }

  async deleteSupplier(id: string): Promise<void> {
    await this.api.delete(`/suppliers/${id}`);
  }

  // Warehouse methods
  async getWarehouses(page = 1, limit = 10, search?: string): Promise<PaginatedResponse<Warehouse>> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append('search', search);
    
    const response: AxiosResponse<ApiResponse<PaginatedResponse<Warehouse>>> = await this.api.get(`/warehouses?${params}`);
    return response.data.data;
  }

  async getWarehouse(id: string): Promise<Warehouse> {
    const response: AxiosResponse<ApiResponse<Warehouse>> = await this.api.get(`/warehouses/${id}`);
    return response.data.data;
  }

  async createWarehouse(warehouseData: Partial<Warehouse>): Promise<Warehouse> {
    const response: AxiosResponse<ApiResponse<Warehouse>> = await this.api.post('/warehouses', warehouseData);
    return response.data.data;
  }

  async updateWarehouse(id: string, warehouseData: Partial<Warehouse>): Promise<Warehouse> {
    const response: AxiosResponse<ApiResponse<Warehouse>> = await this.api.put(`/warehouses/${id}`, warehouseData);
    return response.data.data;
  }

  async deleteWarehouse(id: string): Promise<void> {
    await this.api.delete(`/warehouses/${id}`);
  }

  async searchWarehouses(query: string, limit = 10): Promise<Warehouse[]> {
    const response: AxiosResponse<ApiResponse<Warehouse[]>> = await this.api.get(`/warehouses/search?q=${query}&limit=${limit}`);
    return response.data.data;
  }

  // Inventory methods
  async getInventory(page = 1, limit = 10, search?: string, warehouseId?: string, productId?: string, lowStock?: boolean): Promise<PaginatedResponse<Inventory>> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append('search', search);
    if (warehouseId) params.append('warehouse_id', warehouseId);
    if (productId) params.append('product_id', productId);
    if (lowStock) params.append('low_stock', 'true');
    
    const response: AxiosResponse<ApiResponse<PaginatedResponse<Inventory>>> = await this.api.get(`/inventory?${params}`);
    return response.data.data;
  }

  async getInventoryItem(id: string): Promise<Inventory> {
    const response: AxiosResponse<ApiResponse<Inventory>> = await this.api.get(`/inventory/${id}`);
    return response.data.data;
  }

  async createInventoryItem(inventoryData: InventoryFormData): Promise<Inventory> {
    const response: AxiosResponse<ApiResponse<Inventory>> = await this.api.post('/inventory', inventoryData);
    return response.data.data;
  }

  async updateInventoryItem(id: string, inventoryData: Partial<InventoryFormData>): Promise<Inventory> {
    const response: AxiosResponse<ApiResponse<Inventory>> = await this.api.put(`/inventory/${id}`, inventoryData);
    return response.data.data;
  }

  async deleteInventoryItem(id: string): Promise<void> {
    await this.api.delete(`/inventory/${id}`);
  }

  async searchInventory(query: string, limit = 10): Promise<Inventory[]> {
    const response: AxiosResponse<ApiResponse<Inventory[]>> = await this.api.get(`/inventory/search?q=${query}&limit=${limit}`);
    return response.data.data;
  }

  async getLowStockItems(): Promise<Inventory[]> {
    const response: AxiosResponse<ApiResponse<Inventory[]>> = await this.api.get('/inventory/low-stock');
    return response.data.data;
  }

  async getInventorySummary(): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get('/inventory/summary');
    return response.data.data;
  }

  // Purchase Order methods
  async getPurchaseOrders(page = 1, limit = 10, search?: string, supplierId?: string, status?: string, startDate?: string, endDate?: string): Promise<PaginatedResponse<PurchaseOrder>> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append('search', search);
    if (supplierId) params.append('supplier_id', supplierId);
    if (status) params.append('status', status);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response: AxiosResponse<ApiResponse<PaginatedResponse<PurchaseOrder>>> = await this.api.get(`/purchase-orders?${params}`);
    return response.data.data;
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder> {
    const response: AxiosResponse<ApiResponse<PurchaseOrder>> = await this.api.get(`/purchase-orders/${id}`);
    return response.data.data;
  }

  async createPurchaseOrder(purchaseOrderData: PurchaseOrderFormData): Promise<PurchaseOrder> {
    const response: AxiosResponse<ApiResponse<PurchaseOrder>> = await this.api.post('/purchase-orders', purchaseOrderData);
    return response.data.data;
  }

  async updatePurchaseOrder(id: string, purchaseOrderData: Partial<PurchaseOrderFormData>): Promise<PurchaseOrder> {
    const response: AxiosResponse<ApiResponse<PurchaseOrder>> = await this.api.put(`/purchase-orders/${id}`, purchaseOrderData);
    return response.data.data;
  }

  async deletePurchaseOrder(id: string): Promise<void> {
    await this.api.delete(`/purchase-orders/${id}`);
  }

  async updatePurchaseOrderStatus(id: string, status: string): Promise<PurchaseOrder> {
    const response: AxiosResponse<ApiResponse<PurchaseOrder>> = await this.api.put(`/purchase-orders/${id}/status`, { status });
    return response.data.data;
  }

  async searchPurchaseOrders(query: string, limit = 10): Promise<PurchaseOrder[]> {
    const response: AxiosResponse<ApiResponse<PurchaseOrder[]>> = await this.api.get(`/purchase-orders/search?q=${query}&limit=${limit}`);
    return response.data.data;
  }

  async getPurchaseOrderStats(): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get('/purchase-orders/stats');
    return response.data.data;
  }
}

export const apiService = new ApiService();
export default apiService; 