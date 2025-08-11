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
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Tooltip,
  Grid,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { Supplier } from '../types';
import { apiService } from '../services/api';

interface SupplierDialogProps {
  open: boolean;
  onClose: () => void;
  supplier?: Supplier;
  onSubmit: (data: Partial<Supplier>) => void;
  loading: boolean;
}

const SupplierDialog: React.FC<SupplierDialogProps> = ({
  open,
  onClose,
  supplier,
  onSubmit,
  loading
}) => {
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    contact_person: '',
    is_active: true
  });

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        contact_person: supplier.contact_person,
        is_active: supplier.is_active
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        contact_person: '',
        is_active: true
      });
    }
  }, [supplier]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {supplier ? <EditIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> : <AddIcon sx={{ mr: 1, verticalAlign: 'middle' }} />}
        {supplier ? 'Edit Supplier' : 'Add New Supplier'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Supplier Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                margin="normal"
                InputProps={{
                  startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Person"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                required
                margin="normal"
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                margin="normal"
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                margin="normal"
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                multiline
                rows={3}
                margin="normal"
                InputProps={{
                  startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : (supplier ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSuppliers();
      setSuppliers(response);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load suppliers',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleCreateSupplier = async (data: Partial<Supplier>) => {
    try {
      await apiService.createSupplier(data);
      setSnackbar({
        open: true,
        message: 'Supplier created successfully',
        severity: 'success'
      });
      setDialogOpen(false);
      loadSuppliers();
    } catch (error) {
      console.error('Error creating supplier:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create supplier',
        severity: 'error'
      });
    }
  };

  const handleUpdateSupplier = async (data: Partial<Supplier>) => {
    if (!selectedSupplier) return;
    try {
      await apiService.updateSupplier(selectedSupplier.id, data);
      setSnackbar({
        open: true,
        message: 'Supplier updated successfully',
        severity: 'success'
      });
      setDialogOpen(false);
      setSelectedSupplier(undefined);
      loadSuppliers();
    } catch (error) {
      console.error('Error updating supplier:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update supplier',
        severity: 'error'
      });
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await apiService.deleteSupplier(id);
      setSnackbar({
        open: true,
        message: 'Supplier deleted successfully',
        severity: 'success'
      });
      loadSuppliers();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete supplier',
        severity: 'error'
      });
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDialogOpen(true);
  };

  const handleAddSupplier = () => {
    setSelectedSupplier(undefined);
    setDialogOpen(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Suppliers Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddSupplier}
        >
          Add Supplier
        </Button>
      </Box>

      {/* Suppliers Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Contact Person</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No suppliers found
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2" fontWeight="medium">
                          {supplier.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {supplier.contact_person}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {supplier.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {supplier.phone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {supplier.address}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {supplier.is_active ? (
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
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(supplier.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Supplier">
                        <IconButton
                          size="small"
                          onClick={() => handleEditSupplier(supplier)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Supplier">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteSupplier(supplier.id)}
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
      </Paper>

      {/* Add/Edit Dialog */}
      <SupplierDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedSupplier(undefined);
        }}
        supplier={selectedSupplier}
        onSubmit={selectedSupplier ? handleUpdateSupplier : handleCreateSupplier}
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

export default SuppliersPage; 