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
  Chip,
  Alert,
  Snackbar,
  Tooltip,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LocalShipping as ShippingIcon,
  Store as StoreIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { Inventory, Product, Warehouse, InventoryFormData } from '../types';
import { apiService } from '../services/api';

interface InventoryDialogProps {
  open: boolean;
  onClose: () => void;
  inventory?: Inventory;
  products: Product[];
  warehouses: Warehouse[];
  onSubmit: (data: InventoryFormData) => void;
  loading: boolean;
}

interface InventoryDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  inventory?: Inventory;
}

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  inventory?: Inventory;
  loading: boolean;
}

const InventoryDialog: React.FC<InventoryDialogProps> = ({
  open,
  onClose,
  inventory,
  products,
  warehouses,
  onSubmit,
  loading
}) => {
  const [formData, setFormData] = useState<InventoryFormData>({
    product_id: '',
    warehouse_id: '',
    quantity: 0,
    reserved_quantity: 0
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (inventory) {
      setFormData({
        product_id: inventory.product_id,
        warehouse_id: inventory.warehouse_id,
        quantity: inventory.quantity,
        reserved_quantity: inventory.reserved_quantity
      });
    } else {
      setFormData({
        product_id: '',
        warehouse_id: '',
        quantity: 0,
        reserved_quantity: 0
      });
    }
    setErrors({});
  }, [inventory, open]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.product_id) {
      newErrors.product_id = 'Product is required';
    }

    if (!formData.warehouse_id) {
      newErrors.warehouse_id = 'Warehouse is required';
    }

    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity must be non-negative';
    }

    if (formData.reserved_quantity < 0) {
      newErrors.reserved_quantity = 'Reserved quantity must be non-negative';
    }

    if (formData.reserved_quantity > formData.quantity) {
      newErrors.reserved_quantity = 'Reserved quantity cannot exceed total quantity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof InventoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const getWarehouseName = (warehouseId: string) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse ? warehouse.name : 'Unknown Warehouse';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {inventory ? 'Edit Inventory Item' : 'Add New Inventory Item'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.product_id}>
                <InputLabel>Product</InputLabel>
                <Select
                  value={formData.product_id}
                  onChange={(e) => handleInputChange('product_id', e.target.value)}
                  label="Product"
                  disabled={!!inventory} // Can't change product for existing inventory
                >
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </MenuItem>
                  ))}
                </Select>
                {errors.product_id && (
                  <Typography variant="caption" color="error">
                    {errors.product_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.warehouse_id}>
                <InputLabel>Warehouse</InputLabel>
                <Select
                  value={formData.warehouse_id}
                  onChange={(e) => handleInputChange('warehouse_id', e.target.value)}
                  label="Warehouse"
                  disabled={!!inventory} // Can't change warehouse for existing inventory
                >
                  {warehouses.map((warehouse) => (
                    <MenuItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.warehouse_id && (
                  <Typography variant="caption" color="error">
                    {errors.warehouse_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                error={!!errors.quantity}
                helperText={errors.quantity}
                InputProps={{
                  endAdornment: <InputAdornment position="end">units</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Reserved Quantity"
                type="number"
                value={formData.reserved_quantity}
                onChange={(e) => handleInputChange('reserved_quantity', parseInt(e.target.value) || 0)}
                error={!!errors.reserved_quantity}
                helperText={errors.reserved_quantity}
                InputProps={{
                  endAdornment: <InputAdornment position="end">units</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Available Quantity: {Math.max(0, formData.quantity - formData.reserved_quantity)} units
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total: {formData.quantity} | Reserved: {formData.reserved_quantity} | Available: {Math.max(0, formData.quantity - formData.reserved_quantity)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : undefined}
          >
            {inventory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const InventoryDetailsDialog: React.FC<InventoryDetailsDialogProps> = ({
  open,
  onClose,
  inventory
}) => {
  if (!inventory) return null;

  const availableQuantity = inventory.quantity - inventory.reserved_quantity;
  const isLowStock = availableQuantity <= (inventory.product.reorder_point || 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <InventoryIcon color="primary" />
          Inventory Details
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Product Information
                </Typography>
                <Box mt={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Product Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {inventory.product.name}
                  </Typography>
                </Box>
                <Box mt={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    SKU
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {inventory.product.sku}
                  </Typography>
                </Box>
                <Box mt={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Unit Price
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    ${Number(inventory.product.unit_price).toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Warehouse Information
                </Typography>
                <Box mt={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Warehouse Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {inventory.warehouse.name}
                  </Typography>
                </Box>
                <Box mt={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Address
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {inventory.warehouse.address}
                  </Typography>
                </Box>
                <Box mt={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Capacity
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {inventory.warehouse.capacity ? `${inventory.warehouse.capacity} units` : 'Not specified'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Stock Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Total Quantity
                    </Typography>
                    <Typography variant="h5" color="primary">
                      {inventory.quantity} units
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Reserved Quantity
                    </Typography>
                    <Typography variant="h5" color="warning.main">
                      {inventory.reserved_quantity} units
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Available Quantity
                    </Typography>
                    <Typography variant="h5" color={isLowStock ? 'error' : 'success.main'}>
                      {availableQuantity} units
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Stock Status
                    </Typography>
                    <Chip
                      label={isLowStock ? 'Low Stock' : 'In Stock'}
                      color={isLowStock ? 'error' : 'success'}
                      icon={isLowStock ? <WarningIcon /> : <CheckCircleIcon />}
                    />
                  </Grid>
                </Grid>
                {isLowStock && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Stock is below reorder point ({inventory.product.reorder_point} units)
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Timestamps
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Created
                    </Typography>
                    <Typography variant="body2">
                      {new Date(inventory.created_at).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body2">
                      {new Date(inventory.updated_at).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
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
  inventory,
  loading
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete this inventory item?
        </Typography>
        {inventory && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Product: {inventory.product.name} | Warehouse: {inventory.warehouse.name} | Quantity: {inventory.quantity}
          </Typography>
        )}
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const InventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    warehouseId: '',
    productId: '',
    lowStock: false
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const loadInventory = async () => {
    try {
      setLoading(true);
      const response = await apiService.getInventory(
        page + 1, 
        rowsPerPage, 
        searchTerm, 
        filters.warehouseId || undefined,
        filters.productId || undefined,
        filters.lowStock || undefined
      );
      setInventory(response.data);
      setTotalCount(response.total);
    } catch (error) {
      console.error('Error loading inventory:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load inventory',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await apiService.getProducts(1, 1000);
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadWarehouses = async () => {
    try {
      const response = await apiService.getWarehouses(1, 1000);
      setWarehouses(response.data);
    } catch (error) {
      console.error('Error loading warehouses:', error);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [page, rowsPerPage, searchTerm, filters]);

  useEffect(() => {
    loadProducts();
    loadWarehouses();
  }, []);

  const handleCreateInventory = async (data: InventoryFormData) => {
    try {
      await apiService.createInventoryItem(data);
      setSnackbar({
        open: true,
        message: 'Inventory item created successfully',
        severity: 'success'
      });
      setDialogOpen(false);
      loadInventory();
    } catch (error) {
      console.error('Error creating inventory item:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create inventory item',
        severity: 'error'
      });
    }
  };

  const handleUpdateInventory = async (data: InventoryFormData) => {
    if (!selectedInventory) return;
    
    try {
      await apiService.updateInventoryItem(selectedInventory.id, data);
      setSnackbar({
        open: true,
        message: 'Inventory item updated successfully',
        severity: 'success'
      });
      setDialogOpen(false);
      setSelectedInventory(null);
      loadInventory();
    } catch (error) {
      console.error('Error updating inventory item:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update inventory item',
        severity: 'error'
      });
    }
  };

  const handleDeleteClick = (inventoryItem: Inventory) => {
    setSelectedInventory(inventoryItem);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedInventory) return;
    
    try {
      await apiService.deleteInventoryItem(selectedInventory.id);
      setSnackbar({
        open: true,
        message: 'Inventory item deleted successfully',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      setSelectedInventory(null);
      loadInventory();
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete inventory item',
        severity: 'error'
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedInventory(null);
  };

  const handleViewInventory = (inventoryItem: Inventory) => {
    setSelectedInventory(inventoryItem);
    setDetailsDialogOpen(true);
  };

  const handleEditInventory = (inventoryItem: Inventory) => {
    setSelectedInventory(inventoryItem);
    setDialogOpen(true);
  };

  const handleAddInventory = () => {
    setSelectedInventory(null);
    setDialogOpen(true);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const getStockStatus = (inventoryItem: Inventory) => {
    const available = inventoryItem.quantity - inventoryItem.reserved_quantity;
    const reorderPoint = inventoryItem.product.reorder_point || 0;
    
    if (available <= 0) return { label: 'Out of Stock', color: 'error' as const };
    if (available <= reorderPoint) return { label: 'Low Stock', color: 'warning' as const };
    return { label: 'In Stock', color: 'success' as const };
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Inventory Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddInventory}
        >
          Add Inventory Item
        </Button>
      </Box>

      <Paper sx={{ mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Warehouse</InputLabel>
                <Select
                  value={filters.warehouseId}
                  onChange={(e) => handleFilterChange('warehouseId', e.target.value)}
                  label="Warehouse"
                >
                  <MenuItem value="">All Warehouses</MenuItem>
                  {warehouses.map((warehouse) => (
                    <MenuItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Product</InputLabel>
                <Select
                  value={filters.productId}
                  onChange={(e) => handleFilterChange('productId', e.target.value)}
                  label="Product"
                >
                  <MenuItem value="">All Products</MenuItem>
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.lowStock}
                    onChange={(e) => handleFilterChange('lowStock', e.target.checked)}
                    color="warning"
                  />
                }
                label="Low Stock Only"
              />
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Warehouse</TableCell>
                <TableCell align="right">Total Qty</TableCell>
                <TableCell align="right">Reserved</TableCell>
                <TableCell align="right">Available</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : inventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No inventory items found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                inventory.map((inventoryItem) => {
                  const stockStatus = getStockStatus(inventoryItem);
                  const available = inventoryItem.quantity - inventoryItem.reserved_quantity;
                  
                  return (
                    <TableRow key={inventoryItem.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <InventoryIcon color="primary" fontSize="small" />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {inventoryItem.product.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              SKU: {inventoryItem.product.sku}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <StoreIcon color="action" fontSize="small" />
                          {inventoryItem.warehouse.name}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {inventoryItem.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="warning.main">
                          {inventoryItem.reserved_quantity}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          fontWeight="medium"
                          color={available <= 0 ? 'error' : available <= (inventoryItem.product.reorder_point || 0) ? 'warning.main' : 'success.main'}
                        >
                          {available}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={stockStatus.label}
                          size="small"
                          color={stockStatus.color}
                          icon={stockStatus.color === 'error' ? <CancelIcon /> : stockStatus.color === 'warning' ? <WarningIcon /> : <CheckCircleIcon />}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(inventoryItem.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" gap={1} justifyContent="flex-end">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewInventory(inventoryItem)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEditInventory(inventoryItem)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(inventoryItem)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <InventoryDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        inventory={selectedInventory || undefined}
        products={products}
        warehouses={warehouses}
        onSubmit={selectedInventory ? handleUpdateInventory : handleCreateInventory}
        loading={loading}
      />

      <InventoryDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        inventory={selectedInventory || undefined}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        inventory={selectedInventory || undefined}
        loading={loading}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InventoryPage; 