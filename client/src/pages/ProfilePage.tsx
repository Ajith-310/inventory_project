import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ProfilePage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        User Profile
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          User profile page - Coming soon with profile management and settings
        </Typography>
      </Paper>
    </Box>
  );
};

export default ProfilePage; 