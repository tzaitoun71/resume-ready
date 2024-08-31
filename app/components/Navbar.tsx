'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LogoutIcon from '@mui/icons-material/Logout';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import { useUser } from '../context/UserContext'; // Import your UserContext hook
import { signOut } from 'firebase/auth';
import { auth } from '../firebase'; // Import Firebase auth

const Navbar: React.FC = () => {
  const router = useRouter();
  const { signOutUser } = useUser(); // Use signOutUser function from context

  const handleLogout = async () => {
    try {
      await signOut(auth); // Log out from Firebase
      signOutUser(); // Update context and redirect to login page
      console.log('User logged out');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleBuyNow = () => {
    // Logic to handle Buy Now
    console.log('Redirect to Buy Now page');
    router.push('/buy'); // Example navigation, adjust to your actual route
  };

  return (
    <AppBar position="fixed" color="transparent" elevation={1} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
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
