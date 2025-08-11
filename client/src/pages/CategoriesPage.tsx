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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Category as CategoryIcon,
  Folder as FolderIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { Category } from '../types';
import { apiService } from '../services/api';

interface CategoryDialogProps {
  open: boolean;
  onClose: () => void;
  category?: Category;
  categories: Category[];
  onSubmit: (data: Partial<Category>) => void;
  loading: boolean;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({
  open,
  onClose,
  category,
  categories,
  onSubmit,
  loading
}) => {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    description: '',
    parent_id: ''
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        parent_id: category.parent_id || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        parent_id: ''
      });
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {category ? <EditIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> : <AddIcon sx={{ mr: 1, verticalAlign: 'middle' }} />}
        {category ? 'Edit Category' : 'Add New Category'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category Name"
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
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Parent Category</InputLabel>
                <Select
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                  label="Parent Category"
                >
                  <MenuItem value="">
                    <em>No Parent (Root Category)</em>
                  </MenuItem>
                  {categories
                    .filter(cat => !category || cat.id !== category.id) // Exclude current category from parent options
                    .map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : (category ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCategories();
      setCategories(response);
    } catch (error) {
      console.error('Error loading categories:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load categories',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async (data: Partial<Category>) => {
    try {
      await apiService.createCategory(data);
      setSnackbar({
        open: true,
        message: 'Category created successfully',
        severity: 'success'
      });
      setDialogOpen(false);
      loadCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create category',
        severity: 'error'
      });
    }
  };

  const handleUpdateCategory = async (data: Partial<Category>) => {
    if (!selectedCategory) return;
    try {
      await apiService.updateCategory(selectedCategory.id, data);
      setSnackbar({
        open: true,
        message: 'Category updated successfully',
        severity: 'success'
      });
      setDialogOpen(false);
      setSelectedCategory(undefined);
      loadCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update category',
        severity: 'error'
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await apiService.deleteCategory(id);
      setSnackbar({
        open: true,
        message: 'Category deleted successfully',
        severity: 'success'
      });
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete category',
        severity: 'error'
      });
    }
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleAddCategory = () => {
    setSelectedCategory(undefined);
    setDialogOpen(true);
  };

  const getParentName = (parentId: string) => {
    const parent = categories.find(c => c.id === parentId);
    return parent?.name || 'Root';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          <CategoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Categories Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddCategory}
        >
          Add Category
        </Button>
      </Box>

      {/* Categories Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Parent Category</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FolderIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2" fontWeight="medium">
                          {category.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {category.description || 'No description'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {category.parent_id ? (
                        <Chip
                          label={getParentName(category.parent_id)}
                          size="small"
                          icon={<CategoryIcon />}
                        />
                      ) : (
                        <Chip
                          label="Root Category"
                          size="small"
                          color="primary"
                          icon={<CheckCircleIcon />}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(category.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Category">
                        <IconButton
                          size="small"
                          onClick={() => handleEditCategory(category)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Category">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteCategory(category.id)}
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
      <CategoryDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedCategory(undefined);
        }}
        category={selectedCategory}
        categories={categories}
        onSubmit={selectedCategory ? handleUpdateCategory : handleCreateCategory}
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

export default CategoriesPage; 