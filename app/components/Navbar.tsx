'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; 
import LogoutIcon from '@mui/icons-material/Logout'; 
import ContactPageIcon from '@mui/icons-material/ContactPage';

const Navbar: React.FC = () => {
  const router = useRouter();

  const handleLogout = () => {
    // Logic to handle logout
    console.log('User logged out');
  };

  const handleBuyNow = () => {
    // Logic to handle Buy Now
    console.log('Redirect to Buy Now page');
  };

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between', backgroundColor: '#ffffff', padding: '10px 30px' }}>
        {/* Logo or Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>
          <ContactPageIcon sx={{ color: '#4C51BF' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', marginLeft: '10px' }}>
            ResumeReady
          </Typography>
        </Box>

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button color="inherit" onClick={() => router.push('/dashboard')} sx={{ marginRight: '20px', color: '#333' }}>
            Dashboard
          </Button>
          <Button color="inherit" onClick={() => router.push('/profile')} sx={{ marginRight: '20px', color: '#333' }}>
            Profile
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleBuyNow}
            sx={{
              backgroundColor: '#4C51BF',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '30px',
              marginRight: '20px',
              '&:hover': {
                backgroundColor: '#3b3f7a',
              },
            }}
          >
            Buy Now
          </Button>
          <IconButton color="inherit" onClick={handleLogout} sx={{ color: '#333' }}>
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
