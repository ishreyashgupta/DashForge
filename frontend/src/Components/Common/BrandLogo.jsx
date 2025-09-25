import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const BrandLogo = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
    <Box
      sx={{
        width: 32,
        height: 32,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '16px',
        fontWeight: 'bold',
        mr: 1
      }}
    >
      DF
    </Box>
    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
      DashForge
    </Typography>
  </Box>
);