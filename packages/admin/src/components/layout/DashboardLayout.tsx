import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Breadcrumbs,
  Link,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout,
  Settings,
  Notifications,
  Home,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useLayout } from '../../contexts/LayoutContext';
import { Sidebar } from './Sidebar';

export const DashboardLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const { 
    sidebarOpen, 
    sidebarWidth, 
    toggleSidebar, 
    setSidebarOpen, 
    pageTitle, 
    breadcrumbs 
  } = useLayout();

  const [profileMenuAnchor, setProfileMenuAnchor] = React.useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
  };

  const handleSettings = () => {
    handleProfileMenuClose();
    // Navigate to settings
  };

  // Mobile'da sidebar overlay olarak çalışır
  React.useEffect(() => {
    if (isMobile && sidebarOpen) {
      const handleClickOutside = () => {
        setSidebarOpen(false);
      };
      
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobile, sidebarOpen, setSidebarOpen]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: theme.zIndex.drawer - 1,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(sidebarOpen && !isMobile && {
            marginLeft: `${sidebarWidth}px`,
          }),
        }}
      >
        {/* Top AppBar */}
        <AppBar
          position="sticky"
          elevation={1}
          sx={{
            zIndex: theme.zIndex.drawer + 1,
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar>
            {/* Menu Button */}
            <IconButton
              edge="start"
              color="inherit"
              onClick={toggleSidebar}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>

            {/* Page Title */}
            <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
              {pageTitle}
            </Typography>

            {/* Right Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Notifications */}
              <IconButton color="inherit">
                <Notifications />
              </IconButton>

              {/* Profile Menu */}
              <IconButton
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={{ p: 0.5 }}
              >
                <Avatar
                  sx={{ 
                    width: 40, 
                    height: 40,
                    bgcolor: 'primary.main',
                  }}
                >
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Avatar>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <Box
            sx={{
              px: 3,
              py: 2,
              bgcolor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Breadcrumbs>
              <Link
                href="/"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  textDecoration: 'none',
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                <Home fontSize="small" />
                Ana Sayfa
              </Link>
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        textDecoration: 'none',
                        color: 'text.secondary',
                        '&:hover': { color: 'primary.main' },
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ) : (
                    <Typography
                      color="text.primary"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </Typography>
                  )}
                </React.Fragment>
              ))}
            </Breadcrumbs>
          </Box>
        )}

        {/* Page Content */}
        <Box
          sx={{
            flexGrow: 1,
            bgcolor: 'background.default',
            p: 3,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={profileMenuAnchor}
          open={Boolean(profileMenuAnchor)}
          onClose={handleProfileMenuClose}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <MenuItem sx={{ minWidth: 200 }}>
            <Box>
              <Typography variant="subtitle2" color="text.primary">
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </MenuItem>
          
          <MenuItem onClick={handleSettings}>
            <Settings sx={{ mr: 2 }} />
            Ayarlar
          </MenuItem>
          
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <Logout sx={{ mr: 2 }} />
            Çıkış Yap
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default DashboardLayout;