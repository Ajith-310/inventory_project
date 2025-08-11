import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Warehouse as WarehouseIcon,
  Business as BusinessIcon,
  ShoppingCart as ShoppingCartIcon,
  Warning as WarningIcon,
  AttachMoney as MoneyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { DashboardStats } from '../types';
import apiService from '../services/api';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const dashboardStats = await apiService.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Refresh stats when window gains focus (user navigates back to tab)
    const handleFocus = () => {
      fetchStats();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Refresh stats function
  const refreshStats = async () => {
    try {
      setLoading(true);
      const dashboardStats = await apiService.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Failed to refresh dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: <InventoryIcon />,
      color: '#2196f3',
    },
    {
      title: 'Warehouses',
      value: stats?.totalWarehouses || 0,
      icon: <WarehouseIcon />,
      color: '#4caf50',
    },
    {
      title: 'Suppliers',
      value: stats?.totalSuppliers || 0,
      icon: <BusinessIcon />,
      color: '#ff9800',
    },
    {
      title: 'Purchase Orders',
      value: stats?.totalPurchaseOrders || 0,
      icon: <ShoppingCartIcon />,
      color: '#9c27b0',
    },
    {
      title: 'Low Stock Items',
      value: stats?.lowStockItems || 0,
      icon: <WarningIcon />,
      color: '#f44336',
    },
    {
      title: 'Total Value',
      value: `$${(stats?.totalInventoryValue || 0).toLocaleString()}`,
      icon: <MoneyIcon />,
      color: '#00c853',
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Box>
      {/* Welcome Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'primary.main',
              fontSize: '1.5rem',
            }}
          >
            {user?.first_name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {getGreeting()}, {user?.first_name}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome to your Inventory Management Dashboard
            </Typography>
            <Chip
              label={user?.role?.toUpperCase()}
              color="primary"
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
          <Tooltip title="Refresh Dashboard">
            <IconButton 
              onClick={refreshStats} 
              disabled={loading}
              sx={{ ml: 'auto' }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Stats Grid */}
      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                      {card.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.title}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: card.color,
                    }}
                  >
                    {card.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }}>
              <InventoryIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="body2">Add Product</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }}>
              <ShoppingCartIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="body2">Create PO</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }}>
              <WarehouseIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="body2">Check Inventory</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }}>
              <BusinessIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="body2">Manage Suppliers</Typography>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default DashboardPage; 