import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const UsersPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Users Management
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Users management page - Coming soon with user CRUD operations (Admin only)
        </Typography>
      </Paper>
    </Box>
  );
};

export default UsersPage; 