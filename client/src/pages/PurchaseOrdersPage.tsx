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
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  ShoppingCart as ShoppingCartIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LocalShipping as ShippingIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
import { PurchaseOrder, PurchaseOrderItem, Product, Supplier, PurchaseOrderFormData, PurchaseOrderStatus } from '../types';
import { apiService } from '../services/api';

interface PurchaseOrderDialogProps {
  open: boolean;
  onClose: () => void;
  purchaseOrder?: PurchaseOrder;
  products: Product[];
  suppliers: Supplier[];
  onSubmit: (data: PurchaseOrderFormData) => void;
  loading: boolean;
}

interface PurchaseOrderDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  purchaseOrder?: PurchaseOrder;
}

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  purchaseOrder?: PurchaseOrder;
  loading: boolean;
}

interface StatusUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  purchaseOrder?: PurchaseOrder;
  onStatusUpdate: (status: PurchaseOrderStatus) => void;
  loading: boolean;
}

const PurchaseOrderDialog: React.FC<PurchaseOrderDialogProps> = ({
  open,
  onClose,
  purchaseOrder,
  products,
  suppliers,
  onSubmit,
  loading
}) => {
  const [formData, setFormData] = useState<PurchaseOrderFormData>({
    supplier_id: '',
    expected_delivery_date: '',
    notes: '',
    items: []
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (purchaseOrder) {
      setFormData({
        supplier_id: purchaseOrder.supplier_id,
        expected_delivery_date: purchaseOrder.expected_delivery_date.split('T')[0],
        notes: purchaseOrder.notes || '',
        items: purchaseOrder.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      });
    } else {
      setFormData({
        supplier_id: '',
        expected_delivery_date: '',
        notes: '',
        items: []
      });
    }
    setErrors({});
  }, [purchaseOrder, open]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.supplier_id) {
      newErrors.supplier_id = 'Supplier is required';
    }

    if (!formData.expected_delivery_date) {
      newErrors.expected_delivery_date = 'Expected delivery date is required';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    formData.items.forEach((item, index) => {
      if (!item.product_id) {
        newErrors[`item_${index}_product`] = 'Product is required';
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (item.unit_price <= 0) {
        newErrors[`item_${index}_price`] = 'Unit price must be greater than 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof PurchaseOrderFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: newItems }));
    
    // Clear item-specific errors
    if (errors[`item_${index}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`item_${index}_${field}`];
        return newErrors;
      });
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product_id: '', quantity: 1, unit_price: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Unknown Supplier';
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {purchaseOrder ? 'Edit Purchase Order' : 'Create New Purchase Order'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.supplier_id}>
                <InputLabel>Supplier</InputLabel>
                <Select
                  value={formData.supplier_id}
                  onChange={(e) => handleInputChange('supplier_id', e.target.value)}
                  label="Supplier"
                >
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.supplier_id && (
                  <Typography variant="caption" color="error">
                    {errors.supplier_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Expected Delivery Date"
                type="date"
                value={formData.expected_delivery_date}
                onChange={(e) => handleInputChange('expected_delivery_date', e.target.value)}
                error={!!errors.expected_delivery_date}
                helperText={errors.expected_delivery_date}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Order Items</Typography>
                <Button
                  startIcon={<AddCircleIcon />}
                  onClick={addItem}
                  variant="outlined"
                  size="small"
                >
                  Add Item
                </Button>
              </Box>
              
              {errors.items && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.items}
                </Alert>
              )}

              {formData.items.map((item, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth error={!!errors[`item_${index}_product`]}>
                          <InputLabel>Product</InputLabel>
                          <Select
                            value={item.product_id}
                            onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                            label="Product"
                          >
                            {products.map((product) => (
                              <MenuItem key={product.id} value={product.id}>
                                {product.name} ({product.sku})
                              </MenuItem>
                            ))}
                          </Select>
                          {errors[`item_${index}_product`] && (
                            <Typography variant="caption" color="error">
                              {errors[`item_${index}_product`]}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label="Quantity"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                          error={!!errors[`item_${index}_quantity`]}
                          helperText={errors[`item_${index}_quantity`]}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label="Unit Price"
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          error={!!errors[`item_${index}_price`]}
                          helperText={errors[`item_${index}_price`]}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography variant="body2" color="textSecondary">
                          Total: ${(item.quantity * item.unit_price).toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <IconButton
                          color="error"
                          onClick={() => removeItem(index)}
                          disabled={formData.items.length === 1}
                        >
                          <RemoveCircleIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" align="right">
                    Total Amount: ${calculateTotal().toFixed(2)}
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
            {purchaseOrder ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const PurchaseOrderDetailsDialog: React.FC<PurchaseOrderDetailsDialogProps> = ({
  open,
  onClose,
  purchaseOrder
}) => {
  if (!purchaseOrder) return null;

  const getStatusColor = (status: PurchaseOrderStatus) => {
    switch (status) {
      case PurchaseOrderStatus.DRAFT: return 'default';
      case PurchaseOrderStatus.PENDING: return 'warning';
      case PurchaseOrderStatus.APPROVED: return 'info';
      case PurchaseOrderStatus.ORDERED: return 'primary';
      case PurchaseOrderStatus.PARTIALLY_RECEIVED: return 'warning';
      case PurchaseOrderStatus.RECEIVED: return 'success';
      case PurchaseOrderStatus.CANCELLED: return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: PurchaseOrderStatus) => {
    switch (status) {
      case PurchaseOrderStatus.DRAFT: return <EditIcon />;
      case PurchaseOrderStatus.PENDING: return <WarningIcon />;
      case PurchaseOrderStatus.APPROVED: return <CheckCircleIcon />;
      case PurchaseOrderStatus.ORDERED: return <ShoppingCartIcon />;
      case PurchaseOrderStatus.PARTIALLY_RECEIVED: return <ShippingIcon />;
      case PurchaseOrderStatus.RECEIVED: return <CheckCircleIcon />;
      case PurchaseOrderStatus.CANCELLED: return <CancelIcon />;
      default: return <EditIcon />;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <ShoppingCartIcon color="primary" />
          Purchase Order Details
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Box mt={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    PO Number
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {purchaseOrder.po_number}
                  </Typography>
                </Box>
                <Box mt={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={purchaseOrder.status.replace('_', ' ').toUpperCase()}
                    color={getStatusColor(purchaseOrder.status)}
                    icon={getStatusIcon(purchaseOrder.status)}
                    size="small"
                  />
                </Box>
                <Box mt={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total Amount
                  </Typography>
                                     <Typography variant="h6" color="primary">
                     ${Number(purchaseOrder.total_amount).toFixed(2)}
                   </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Supplier & Dates
                </Typography>
                <Box mt={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Supplier
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {purchaseOrder.supplier.name}
                  </Typography>
                </Box>
                <Box mt={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Order Date
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {new Date(purchaseOrder.order_date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box mt={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Expected Delivery
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {new Date(purchaseOrder.expected_delivery_date).toLocaleDateString()}
                  </Typography>
                </Box>
                {purchaseOrder.actual_delivery_date && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Actual Delivery
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {new Date(purchaseOrder.actual_delivery_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Items
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Unit Price</TableCell>
                        <TableCell align="right">Total Price</TableCell>
                        <TableCell align="right">Received</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {purchaseOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {item.product.name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                SKU: {item.product.sku}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                                                     <TableCell align="right">${Number(item.unit_price).toFixed(2)}</TableCell>
                           <TableCell align="right">${Number(item.total_price).toFixed(2)}</TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`${item.received_quantity}/${item.quantity}`}
                              size="small"
                              color={item.received_quantity === item.quantity ? 'success' : 'warning'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {purchaseOrder.notes && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Notes
                  </Typography>
                  <Typography variant="body2">
                    {purchaseOrder.notes}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

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
                      {new Date(purchaseOrder.created_at).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body2">
                      {new Date(purchaseOrder.updated_at).toLocaleString()}
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

const StatusUpdateDialog: React.FC<StatusUpdateDialogProps> = ({
  open,
  onClose,
  purchaseOrder,
  onStatusUpdate,
  loading
}) => {
  const [selectedStatus, setSelectedStatus] = useState<PurchaseOrderStatus>(PurchaseOrderStatus.PENDING);

  useEffect(() => {
    if (purchaseOrder) {
      setSelectedStatus(purchaseOrder.status);
    }
  }, [purchaseOrder]);

  const handleUpdate = () => {
    onStatusUpdate(selectedStatus);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Purchase Order Status</DialogTitle>
      <DialogContent>
        <Box mt={2}>
          <Typography variant="body2" gutterBottom>
            Current Status: <strong>{purchaseOrder?.status.replace('_', ' ').toUpperCase()}</strong>
          </Typography>
        </Box>
        <Box mt={3}>
          <FormControl fullWidth>
            <InputLabel>New Status</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as PurchaseOrderStatus)}
              label="New Status"
            >
              {Object.values(PurchaseOrderStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status.replace('_', ' ').toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleUpdate}
          variant="contained"
          disabled={loading || selectedStatus === purchaseOrder?.status}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          Update Status
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  purchaseOrder,
  loading
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete this purchase order?
        </Typography>
        {purchaseOrder && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                         PO Number: {purchaseOrder.po_number} | Supplier: {purchaseOrder.supplier.name} | Amount: ${Number(purchaseOrder.total_amount).toFixed(2)}
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

const PurchaseOrdersPage: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    supplierId: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const loadPurchaseOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPurchaseOrders(
        page + 1, 
        rowsPerPage, 
        searchTerm, 
        filters.supplierId || undefined,
        filters.status || undefined,
        filters.startDate || undefined,
        filters.endDate || undefined
      );
      setPurchaseOrders(response.data);
      setTotalCount(response.total);
    } catch (error) {
      console.error('Error loading purchase orders:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load purchase orders',
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

  const loadSuppliers = async () => {
    try {
      const response = await apiService.getSuppliers();
      setSuppliers(response);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  useEffect(() => {
    loadPurchaseOrders();
  }, [page, rowsPerPage, searchTerm, filters]);

  useEffect(() => {
    loadProducts();
    loadSuppliers();
  }, []);

  const handleCreatePurchaseOrder = async (data: PurchaseOrderFormData) => {
    try {
      await apiService.createPurchaseOrder(data);
      setSnackbar({
        open: true,
        message: 'Purchase order created successfully',
        severity: 'success'
      });
      setDialogOpen(false);
      loadPurchaseOrders();
    } catch (error) {
      console.error('Error creating purchase order:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create purchase order',
        severity: 'error'
      });
    }
  };

  const handleUpdatePurchaseOrder = async (data: PurchaseOrderFormData) => {
    if (!selectedPurchaseOrder) return;
    
    try {
      await apiService.updatePurchaseOrder(selectedPurchaseOrder.id, data);
      setSnackbar({
        open: true,
        message: 'Purchase order updated successfully',
        severity: 'success'
      });
      setDialogOpen(false);
      setSelectedPurchaseOrder(null);
      loadPurchaseOrders();
    } catch (error) {
      console.error('Error updating purchase order:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update purchase order',
        severity: 'error'
      });
    }
  };

  const handleStatusUpdate = async (status: PurchaseOrderStatus) => {
    if (!selectedPurchaseOrder) return;
    
    try {
      await apiService.updatePurchaseOrderStatus(selectedPurchaseOrder.id, status);
      setSnackbar({
        open: true,
        message: 'Purchase order status updated successfully',
        severity: 'success'
      });
      setStatusDialogOpen(false);
      setSelectedPurchaseOrder(null);
      loadPurchaseOrders();
    } catch (error) {
      console.error('Error updating purchase order status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update purchase order status',
        severity: 'error'
      });
    }
  };

  const handleDeleteClick = (purchaseOrder: PurchaseOrder) => {
    setSelectedPurchaseOrder(purchaseOrder);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPurchaseOrder) return;
    
    try {
      await apiService.deletePurchaseOrder(selectedPurchaseOrder.id);
      setSnackbar({
        open: true,
        message: 'Purchase order deleted successfully',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      setSelectedPurchaseOrder(null);
      loadPurchaseOrders();
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete purchase order',
        severity: 'error'
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedPurchaseOrder(null);
  };

  const handleViewPurchaseOrder = (purchaseOrder: PurchaseOrder) => {
    setSelectedPurchaseOrder(purchaseOrder);
    setDetailsDialogOpen(true);
  };

  const handleEditPurchaseOrder = (purchaseOrder: PurchaseOrder) => {
    setSelectedPurchaseOrder(purchaseOrder);
    setDialogOpen(true);
  };

  const handleStatusClick = (purchaseOrder: PurchaseOrder) => {
    setSelectedPurchaseOrder(purchaseOrder);
    setStatusDialogOpen(true);
  };

  const handleAddPurchaseOrder = () => {
    setSelectedPurchaseOrder(null);
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

  const getStatusColor = (status: PurchaseOrderStatus) => {
    switch (status) {
      case PurchaseOrderStatus.DRAFT: return 'default';
      case PurchaseOrderStatus.PENDING: return 'warning';
      case PurchaseOrderStatus.APPROVED: return 'info';
      case PurchaseOrderStatus.ORDERED: return 'primary';
      case PurchaseOrderStatus.PARTIALLY_RECEIVED: return 'warning';
      case PurchaseOrderStatus.RECEIVED: return 'success';
      case PurchaseOrderStatus.CANCELLED: return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: PurchaseOrderStatus) => {
    switch (status) {
      case PurchaseOrderStatus.DRAFT: return <EditIcon />;
      case PurchaseOrderStatus.PENDING: return <WarningIcon />;
      case PurchaseOrderStatus.APPROVED: return <CheckCircleIcon />;
      case PurchaseOrderStatus.ORDERED: return <ShoppingCartIcon />;
      case PurchaseOrderStatus.PARTIALLY_RECEIVED: return <ShippingIcon />;
      case PurchaseOrderStatus.RECEIVED: return <CheckCircleIcon />;
      case PurchaseOrderStatus.CANCELLED: return <CancelIcon />;
      default: return <EditIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Purchase Orders Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddPurchaseOrder}
        >
          Create Purchase Order
        </Button>
      </Box>

      <Paper sx={{ mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search purchase orders..."
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
                <InputLabel>Supplier</InputLabel>
                <Select
                  value={filters.supplierId}
                  onChange={(e) => handleFilterChange('supplierId', e.target.value)}
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
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {Object.values(PurchaseOrderStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.replace('_', ' ').toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
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
                <TableCell>PO Number</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Total Amount</TableCell>
                <TableCell>Order Date</TableCell>
                <TableCell>Expected Delivery</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : purchaseOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No purchase orders found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                purchaseOrders.map((purchaseOrder) => (
                  <TableRow key={purchaseOrder.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <ShoppingCartIcon color="primary" fontSize="small" />
                        <Typography variant="body2" fontWeight="medium">
                          {purchaseOrder.po_number}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <BusinessIcon color="action" fontSize="small" />
                        {purchaseOrder.supplier.name}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={purchaseOrder.status.replace('_', ' ').toUpperCase()}
                        size="small"
                        color={getStatusColor(purchaseOrder.status)}
                        icon={getStatusIcon(purchaseOrder.status)}
                      />
                    </TableCell>
                                         <TableCell align="right">
                       <Typography variant="body2" fontWeight="medium">
                         ${Number(purchaseOrder.total_amount).toFixed(2)}
                       </Typography>
                     </TableCell>
                    <TableCell>
                      {new Date(purchaseOrder.order_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(purchaseOrder.expected_delivery_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" gap={1} justifyContent="flex-end">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewPurchaseOrder(purchaseOrder)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Update Status">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleStatusClick(purchaseOrder)}
                          >
                            <UpdateIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditPurchaseOrder(purchaseOrder)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(purchaseOrder)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
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

      <PurchaseOrderDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        purchaseOrder={selectedPurchaseOrder || undefined}
        products={products}
        suppliers={suppliers}
        onSubmit={selectedPurchaseOrder ? handleUpdatePurchaseOrder : handleCreatePurchaseOrder}
        loading={loading}
      />

      <PurchaseOrderDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        purchaseOrder={selectedPurchaseOrder || undefined}
      />

      <StatusUpdateDialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        purchaseOrder={selectedPurchaseOrder || undefined}
        onStatusUpdate={handleStatusUpdate}
        loading={loading}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        purchaseOrder={selectedPurchaseOrder || undefined}
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

export default PurchaseOrdersPage; 