import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { fetchCurrentUser } from '../../store/slices/userSlice';
import { Box, AppBar, Toolbar, Typography, Drawer, Divider, 
         List, ListItem, ListItemButton, ListItemIcon, ListItemText,
         IconButton, Avatar, Menu, MenuItem, CircularProgress } from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
  School as SchoolIcon,
  SupervisorAccount as SupervisorIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { USER_ROLES } from '../../config';

// Drawer width
const drawerWidth = 240;

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { currentUser, loading } = useSelector(state => state.users);
  
  // Local state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Fetch current user info when component mounts
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);
  
  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // Handle user menu
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  // Handle logout
  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };
  
  // Navigation items based on user role
  const getNavigationItems = () => {
    const items = [
      {
        text: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/dashboard',
        roles: [USER_ROLES.ADMIN, USER_ROLES.STUDENT, USER_ROLES.TUTOR],
      },
    ];
    
    // Student navigation items
    if (user?.role === USER_ROLES.STUDENT) {
      items.push(
        {
          text: 'My Assignments',
          icon: <AssignmentIcon />,
          path: '/assignments',
          roles: [USER_ROLES.STUDENT],
        },
        {
          text: 'Submit Assignment',
          icon: <AddIcon />,
          path: '/assignments/submit',
          roles: [USER_ROLES.STUDENT],
        }
      );
    }
    
    // Tutor navigation items
    if (user?.role === USER_ROLES.TUTOR) {
      items.push(
        {
          text: 'Assigned Assignments',
          icon: <AssignmentIcon />,
          path: '/tutor/assignments',
          roles: [USER_ROLES.TUTOR],
        }
      );
    }
    
    // Admin navigation items
    if (user?.role === USER_ROLES.ADMIN) {
      items.push(
        {
          text: 'Admin Dashboard',
          icon: <SupervisorIcon />,
          path: '/admin',
          roles: [USER_ROLES.ADMIN],
        },
        {
          text: 'Manage Users',
          icon: <PersonIcon />,
          path: '/admin/users',
          roles: [USER_ROLES.ADMIN],
        },
        {
          text: 'Manage Subjects',
          icon: <CategoryIcon />,
          path: '/admin/subjects',
          roles: [USER_ROLES.ADMIN],
        }
      );
    }
    
    return items;
  };
  
  // Create the drawer content
  const drawer = (
    <div>
      <Toolbar className="flex justify-center">
        <Typography variant="h6" noWrap component="div" className="font-bold">
          Assignment App
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {getNavigationItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              className={window.location.pathname === item.path ? "bg-blue-50" : ""}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );
  
  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box className="flex">
      {/* App Bar */}
      <AppBar
        position="fixed"
        className="z-10"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className="mr-2"
            sx={{ display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" className="flex-grow">
            Assignment Management System
          </Typography>
          
          {/* User profile menu */}
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar className="bg-blue-700">
                {currentUser?.name?.charAt(0) || user?.role?.charAt(0)?.toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
            >
              <MenuItem disabled>
                <div className="flex flex-col">
                  <Typography variant="subtitle1">{currentUser?.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </Typography>
                </div>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation drawer"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar /> {/* Empty toolbar for spacing */}
        <Outlet /> {/* Render child routes */}
      </Box>
    </Box>
  );
};

export default Layout;