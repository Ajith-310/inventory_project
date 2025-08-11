import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  Paper,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error, clearError } = useAuth();

  useEffect(() => {
    // Clear any existing errors when component mounts
    clearError();
  }, [clearError]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await login(formData);
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Paper
        elevation={24}
        sx={{
          maxWidth: 400,
          width: '100%',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)',
            p: 3,
            textAlign: 'center',
            color: 'white',
          }}
        >
          <InventoryIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Inventory MS
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to your account
          </Typography>
        </Box>

        {/* Login Form */}
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
              required
              autoComplete="email"
              autoFocus
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              error={!!errors.password}
              helperText={errors.password}
              margin="normal"
              required
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              startIcon={<LoginIcon />}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                },
              }}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>

          {/* Demo Credentials */}
          <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Demo Credentials:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Admin:</strong> admin@inventory.com / admin123
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Manager:</strong> manager@inventory.com / manager123
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Operator:</strong> operator@inventory.com / operator123
            </Typography>
          </Box>
        </CardContent>
      </Paper>
    </Box>
  );
};

export default LoginPage; 