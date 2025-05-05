import { useState } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Assignment,
  Person,
  Logout
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

const DRAWER_WIDTH = 240;

export default function DashboardLayout({ children }) {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove auth token
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
    { text: 'Logout', icon: <Logout />, onClick: handleLogout }  // Changed to use onClick instead of path
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => setOpen(!open)}
            edge="start"
            sx={{ 
              marginRight: 2,
              display: { xs: 'none', sm: 'flex' }  // Hide on mobile
            }}
          >
            <MenuIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => setOpen(!open)}
            edge="start"
            sx={{ 
              marginRight: 2,
              display: { xs: 'flex', sm: 'none' }  // Show only on mobile
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            Task Manager
          </Typography>
          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ padding: 0 }}
          >
            <Avatar sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }} />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant={{ xs: 'temporary', sm: 'permanent' }}
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          width: open ? DRAWER_WIDTH : 72,
          transition: theme.transitions.create('width'),
          display: { xs: open ? 'block' : 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: open ? DRAWER_WIDTH : 72,
            transition: theme.transitions.create('width'),
            overflowX: 'hidden',
          },
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <ListItem
              component="div"
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else {
                  navigate(item.path);
                }
                if (window.innerWidth < 600) setOpen(false);
              }}
              sx={{ 
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
              key={item.text}
            >
              <ListItemIcon sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  opacity: open ? 1 : 0,
                  '& .MuiTypography-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }
                }}
              />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { 
            xs: '100%',
            sm: `calc(100% - ${open ? DRAWER_WIDTH : 72}px)`
          },
          transition: theme.transitions.create('width'),
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}