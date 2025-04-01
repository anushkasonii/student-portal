import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/api';
import { Box, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Avatar, Typography, Divider } from '@mui/material';
import { LogOut, User } from 'lucide-react';

const ProfileMenu = ({ userRole }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <IconButton 
        onClick={() => setOpen(true)}
        sx={{ 
          position: 'absolute',
          top: 10,
          right: 10,
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          '&:hover': { backgroundColor: '#f5f5f5' }
        }}
      >
        <Avatar sx={{ bgcolor: '#d05c24', width: 35, height: 35 }}>
          <User size={20} />
        </Avatar>
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: 300,
            borderRadius: '20px 0 0 20px',
            padding: '20px',
            backgroundColor: '#ffffff',
            boxShadow: '-5px 0 25px rgba(0,0,0,0.1)',
          }
        }}
        SlideProps={{
          timeout: 300,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3, mt: 2 }}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              margin: '0 auto', 
              bgcolor: '#d05c24',
              boxShadow: '0 4px 15px rgba(208, 92, 36, 0.2)'
            }}
          >
            <User size={40} />
          </Avatar>
          <Typography variant="h6" sx={{ mt: 2, color: '#2d3748', fontWeight: 600 }}>
            {userRole.toUpperCase()} Portal
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <List>
          <ListItem 
            button 
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(208, 92, 36, 0.1)',
              }
            }}
          >
            <ListItemIcon>
              <LogOut color="#d05c24" size={20} />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              sx={{ 
                '& .MuiTypography-root': { 
                  color: '#d05c24',
                  fontWeight: 500
                } 
              }} 
            />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default ProfileMenu;