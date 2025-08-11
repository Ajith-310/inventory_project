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
  Warehouse as WarehouseIcon,
  LocationOn as LocationIcon,
  Storage as StorageIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { Warehouse, WarehouseFormData } from '../types';
import { apiService } from '../services/api';

interface WarehouseDialogProps {
  open: boolean;
  onClose: () => void;
  warehouse?: Warehouse;
  onSubmit: (data: WarehouseFormData) => void;
  loading: boolean;
}

interface WarehouseDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  warehouse?: Warehouse;
}

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  warehouse?: Warehouse;
  loading: boolean;
}

const WarehouseDialog: React.FC<WarehouseDialogProps> = ({
  open,
  onClose,
  warehouse,
  onSubmit,
  loading
}) => {
  const [formData, setFormData] = useState<WarehouseFormData>({
    name: '',
    address: '',
    capacity: 0,
    is_active: true
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name,
        address: warehouse.address,
        capacity: warehouse.capacity || 0,
        is_active: warehouse.is_active
      });
    } else {
      setFormData({
        name: '',
        address: '',
        capacity: 0,
        is_active: true
      });
    }
    setErrors({});
  }, [warehouse, open]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (formData.capacity !== undefined && formData.capacity < 0) {
      newErrors.capacity = 'Capacity must be non-negative';
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

  const handleInputChange = (field: keyof WarehouseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {warehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Warehouse Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                error={!!errors.address}
                helperText={errors.address}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                error={!!errors.capacity}
                helperText={errors.capacity}
                InputProps={{
                  endAdornment: <InputAdornment position="end">units</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    color="primary"
                  />
                }
                label="Active"
              />
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
            {warehouse ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const WarehouseDetailsDialog: React.FC<WarehouseDetailsDialogProps> = ({
  open,
  onClose,
  warehouse
}) => {
  if (!warehouse) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WarehouseIcon color="primary" />
          Warehouse Details
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
                    Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {warehouse.name}
                  </Typography>
                </Box>
                <Box mt={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={warehouse.is_active ? 'Active' : 'Inactive'}
                    color={warehouse.is_active ? 'success' : 'default'}
                    size="small"
                    icon={warehouse.is_active ? <CheckCircleIcon /> : <CancelIcon />}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Location & Capacity
                </Typography>
                <Box mt={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Address
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {warehouse.address}
                  </Typography>
                </Box>
                <Box mt={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Capacity
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {warehouse.capacity ? `${warehouse.capacity} units` : 'Not specified'}
                  </Typography>
                </Box>
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
                      {new Date(warehouse.created_at).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body2">
                      {new Date(warehouse.updated_at).toLocaleString()}
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
  warehouse,
  loading
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete the warehouse "{warehouse?.name}"?
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          This action cannot be undone. The warehouse will be marked as inactive.
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

const WarehousesPage: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const response = await apiService.getWarehouses(page + 1, rowsPerPage, searchTerm);
      setWarehouses(response.data);
      setTotalCount(response.total);
    } catch (error) {
      console.error('Error loading warehouses:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load warehouses',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, [page, rowsPerPage, searchTerm]);

  const handleCreateWarehouse = async (data: WarehouseFormData) => {
    try {
      await apiService.createWarehouse(data);
      setSnackbar({
        open: true,
        message: 'Warehouse created successfully',
        severity: 'success'
      });
      setDialogOpen(false);
      loadWarehouses();
    } catch (error) {
      console.error('Error creating warehouse:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create warehouse',
        severity: 'error'
      });
    }
  };

  const handleUpdateWarehouse = async (data: WarehouseFormData) => {
    if (!selectedWarehouse) return;
    
    try {
      await apiService.updateWarehouse(selectedWarehouse.id, data);
      setSnackbar({
        open: true,
        message: 'Warehouse updated successfully',
        severity: 'success'
      });
      setDialogOpen(false);
      setSelectedWarehouse(null);
      loadWarehouses();
    } catch (error) {
      console.error('Error updating warehouse:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update warehouse',
        severity: 'error'
      });
    }
  };

  const handleDeleteClick = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedWarehouse) return;
    
    try {
      await apiService.deleteWarehouse(selectedWarehouse.id);
      setSnackbar({
        open: true,
        message: 'Warehouse deleted successfully',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      setSelectedWarehouse(null);
      loadWarehouses();
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete warehouse',
        severity: 'error'
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedWarehouse(null);
  };

  const handleViewWarehouse = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setDetailsDialogOpen(true);
  };

  const handleEditWarehouse = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setDialogOpen(true);
  };

  const handleAddWarehouse = () => {
    setSelectedWarehouse(null);
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

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Warehouses Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddWarehouse}
        >
          Add Warehouse
        </Button>
      </Box>

      <Paper sx={{ mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search warehouses..."
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
        </Box>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : warehouses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No warehouses found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                warehouses.map((warehouse) => (
                  <TableRow key={warehouse.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <WarehouseIcon color="primary" fontSize="small" />
                        {warehouse.name}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationIcon color="action" fontSize="small" />
                        {warehouse.address}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <StorageIcon color="action" fontSize="small" />
                        {warehouse.capacity ? `${warehouse.capacity} units` : 'Not specified'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {warehouse.is_active ? (
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
                          color="default"
                          icon={<CancelIcon />}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(warehouse.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" gap={1} justifyContent="flex-end">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewWarehouse(warehouse)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditWarehouse(warehouse)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(warehouse)}
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

      <WarehouseDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        warehouse={selectedWarehouse || undefined}
        onSubmit={selectedWarehouse ? handleUpdateWarehouse : handleCreateWarehouse}
        loading={loading}
      />

      <WarehouseDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        warehouse={selectedWarehouse || undefined}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        warehouse={selectedWarehouse || undefined}
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

export default WarehousesPage; 