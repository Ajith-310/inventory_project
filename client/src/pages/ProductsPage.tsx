import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  Tooltip,
  Fab,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { Product, Category, Supplier, ProductFormData } from '../types';
import { apiService } from '../services/api';

interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  product?: Product;
  categories: Category[];
  suppliers: Supplier[];
  onSubmit: (data: ProductFormData) => void;
  loading: boolean;
}

interface ProductDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  product?: Product;
  categories: Category[];
  suppliers: Supplier[];
}

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product?: Product;
  loading: boolean;
}

const ProductDialog: React.FC<ProductDialogProps> = ({
  open,
  onClose,
  product,
  categories,
  suppliers,
  onSubmit,
  loading
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    sku: '',
    name: '',
    description: '',
    category_id: '',
    supplier_id: '',
    unit_price: 0,
    reorder_point: 0,
    max_stock: 0,
    is_active: true
  });

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        category_id: product.category_id || '',
        supplier_id: product.supplier_id || '',
        unit_price: Number(product.unit_price) || 0,
        reorder_point: Number(product.reorder_point) || 0,
        max_stock: Number(product.max_stock) || 0,
        is_active: product.is_active
      });
    } else {
      setFormData({
        sku: '',
        name: '',
        description: '',
        category_id: '',
        supplier_id: '',
        unit_price: 0,
        reorder_point: 0,
        max_stock: 0,
        is_active: true
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {product ? <EditIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> : <AddIcon sx={{ mr: 1, verticalAlign: 'middle' }} />}
        {product ? 'Edit Product' : 'Add New Product'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SKU"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  label="Category"
                >
                  <MenuItem value="">
                    <em>Select Category</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Supplier</InputLabel>
                <Select
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  label="Supplier"
                >
                  <MenuItem value="">
                    <em>Select Supplier</em>
                  </MenuItem>
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Unit Price"
                type="number"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Reorder Point"
                type="number"
                value={formData.reorder_point}
                onChange={(e) => setFormData({ ...formData, reorder_point: parseInt(e.target.value) || 0 })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Max Stock"
                type="number"
                value={formData.max_stock}
                onChange={(e) => setFormData({ ...formData, max_stock: parseInt(e.target.value) || 0 })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active || false}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="Active Status"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : (product ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const ProductDetailsDialog: React.FC<ProductDetailsDialogProps> = ({
  open,
  onClose,
  product,
  categories,
  suppliers
}) => {
  if (!product) return null;

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'N/A';
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.name || 'N/A';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <InventoryIcon />
          Product Details
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              SKU
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <Chip
                label={product.sku}
                size="small"
                variant="outlined"
                icon={<InventoryIcon />}
              />
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Product Name
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, fontWeight: 'medium' }}>
              {product.name}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {product.description || 'No description available'}
            </Typography>
          </Grid>

          {/* Category and Supplier */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Classification
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Category
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <Chip
                label={getCategoryName(product.category_id)}
                size="small"
                icon={<CategoryIcon />}
              />
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Supplier
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <Chip
                label={getSupplierName(product.supplier_id)}
                size="small"
                icon={<BusinessIcon />}
              />
            </Typography>
          </Grid>

          {/* Pricing and Stock Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Pricing & Stock
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Unit Price
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {product.unit_price ? (
                <Chip
                  label={`$${Number(product.unit_price).toFixed(2)}`}
                  size="small"
                  color="primary"
                  icon={<MoneyIcon />}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Not set
                </Typography>
              )}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Reorder Point
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {Number(product.reorder_point) || 0}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Max Stock
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {product.max_stock ? Number(product.max_stock) : 'Not set'}
            </Typography>
          </Grid>

          {/* Status and Timestamps */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Status & Timestamps
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {product.is_active ? (
                <Chip
                  label="Active"
                  size="small"
                  color="success"
                  icon={<CheckCircleIcon />}
                />
              ) : (
                <Chip
                  label="Inactive"
                  size="small"
                  color="error"
                  icon={<CancelIcon />}
                />
              )}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Created
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {new Date(product.created_at).toLocaleDateString()} at {new Date(product.created_at).toLocaleTimeString()}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Last Updated
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {new Date(product.updated_at).toLocaleDateString()} at {new Date(product.updated_at).toLocaleTimeString()}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  product,
  loading
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <DeleteIcon color="error" />
          Confirm Deletion
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Are you sure you want to delete this product?
        </Typography>
        {product && (
          <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <InventoryIcon color="action" />
              <Box>
                <Typography variant="subtitle1" fontWeight="medium">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  SKU: {product.sku}
                </Typography>
                {product.description && (
                  <Typography variant="body2" color="text.secondary">
                    {product.description}
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        )}
        <Typography variant="body2" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon fontSize="small" />
          This action cannot be undone. The product will be marked as inactive.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color="error" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <DeleteIcon />}
        >
          {loading ? 'Deleting...' : 'Delete Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [productToDelete, setProductToDelete] = useState<Product | undefined>();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProducts(
        page + 1,
        rowsPerPage,
        search || undefined
      );
      setProducts(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Error loading products:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load products',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      setCategories(response);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await apiService.getSuppliers();
      setSuppliers(response);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    loadCategories();
    loadSuppliers();
  }, []);

  const handleCreateProduct = async (data: ProductFormData) => {
    try {
      await apiService.createProduct(data);
      setSnackbar({
        open: true,
        message: 'Product created successfully',
        severity: 'success'
      });
      setDialogOpen(false);
      loadProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create product',
        severity: 'error'
      });
    }
  };

  const handleUpdateProduct = async (data: ProductFormData) => {
    if (!selectedProduct) return;
    try {
      await apiService.updateProduct(selectedProduct.id, data);
      setSnackbar({
        open: true,
        message: 'Product updated successfully',
        severity: 'success'
      });
      setDialogOpen(false);
      setSelectedProduct(undefined);
      loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update product',
        severity: 'error'
      });
    }
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    try {
      await apiService.deleteProduct(productToDelete.id);
      setSnackbar({
        open: true,
        message: 'Product deleted successfully',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      setProductToDelete(undefined);
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete product',
        severity: 'error'
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(undefined);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setDetailsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleAddProduct = () => {
    setSelectedProduct(undefined);
    setDialogOpen(true);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'N/A';
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.name || 'N/A';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Products Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddProduct}
        >
          Add Product
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth>
              <InputLabel>Supplier</InputLabel>
              <Select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                label="Supplier"
              >
                <MenuItem value="">All Suppliers</MenuItem>
                {suppliers.map((supplier) => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={activeFilter === true}
                  onChange={(e) => setActiveFilter(e.target.checked ? true : null)}
                />
              }
              label="Active Only"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Products Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Reorder Point</TableCell>
                <TableCell align="right">Max Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Chip
                        label={product.sku}
                        size="small"
                        variant="outlined"
                        icon={<InventoryIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        fontWeight="medium"
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { 
                            color: 'primary.main',
                            textDecoration: 'underline'
                          }
                        }}
                        onClick={() => handleViewProduct(product)}
                      >
                        {product.name}
                      </Typography>
                      {product.description && (
                        <Typography variant="caption" color="text.secondary">
                          {product.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getCategoryName(product.category_id)}
                        size="small"
                        icon={<CategoryIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getSupplierName(product.supplier_id)}
                        size="small"
                        icon={<BusinessIcon />}
                      />
                    </TableCell>
                                         <TableCell align="right">
                       {product.unit_price ? (
                         <Chip
                           label={`$${Number(product.unit_price).toFixed(2)}`}
                           size="small"
                           color="primary"
                           icon={<MoneyIcon />}
                         />
                       ) : (
                         <Typography variant="caption" color="text.secondary">
                           N/A
                         </Typography>
                       )}
                     </TableCell>
                                         <TableCell align="right">
                       {Number(product.reorder_point) || 0}
                     </TableCell>
                     <TableCell align="right">
                       {product.max_stock ? Number(product.max_stock) : 'N/A'}
                     </TableCell>
                    <TableCell>
                      {product.is_active ? (
                        <Chip
                          label="Active"
                          size="small"
                          color="success"
                          icon={<CheckCircleIcon />}
                        />
                      ) : (
                        <Chip
                          label="Inactive"
                          size="small"
                          color="error"
                          icon={<CancelIcon />}
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small"
                          onClick={() => handleViewProduct(product)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Product">
                        <IconButton
                          size="small"
                          onClick={() => handleEditProduct(product)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                                             <Tooltip title="Delete Product">
                         <IconButton
                           size="small"
                           color="error"
                           onClick={() => handleDeleteClick(product)}
                         >
                           <DeleteIcon />
                         </IconButton>
                       </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <ProductDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedProduct(undefined);
        }}
        product={selectedProduct}
        categories={categories}
        suppliers={suppliers}
        onSubmit={selectedProduct ? handleUpdateProduct : handleCreateProduct}
        loading={loading}
      />

      {/* Product Details Dialog */}
      <ProductDetailsDialog
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedProduct(undefined);
        }}
        product={selectedProduct}
        categories={categories}
        suppliers={suppliers}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        product={productToDelete}
        loading={loading}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductsPage; 