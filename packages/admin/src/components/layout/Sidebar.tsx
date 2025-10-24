import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Collapse,
  Badge,
  useTheme,
} from '@mui/material';
import {
  Dashboard,
  LocalShipping,
  People,
  Business,
  Assessment,
  Settings,
  ExpandLess,
  ExpandMore,
  Inventory,
  TrendingUp,
  NotificationsActive,
  Security,
  Payment,
  LocationOn,
} from '@mui/icons-material';
import { useLayout } from '../../contexts/LayoutContext';
import { usePermissions } from '../../contexts/AuthContext';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  badge?: number;
  children?: MenuItem[];
  permission?: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Dashboard />,
    path: '/',
  },
  {
    id: 'shipments',
    label: 'Gönderiler',
    icon: <LocalShipping />,
    permission: 'read:shipments',
    children: [
      {
        id: 'all-shipments',
        label: 'Tüm Gönderiler',
        icon: <Inventory />,
        path: '/shipments',
        badge: 42, // Dynamic olarak set edilecek
      },
      {
        id: 'active-shipments',
        label: 'Aktif Gönderiler',
        icon: <TrendingUp />,
        path: '/shipments?status=active',
        badge: 15,
      },
      {
        id: 'tracking',
        label: 'Takip Yönetimi',
        icon: <LocationOn />,
        path: '/shipments/tracking',
      },
    ],
  },
  {
    id: 'users',
    label: 'Kullanıcılar',
    icon: <People />,
    permission: 'read:users',
    children: [
      {
        id: 'all-users',
        label: 'Tüm Kullanıcılar',
        icon: <People />,
        path: '/users',
      },
      {
        id: 'user-verification',
        label: 'Doğrulama Bekleyen',
        icon: <Security />,
        path: '/users?status=pending',
        badge: 8,
      },
    ],
  },
  {
    id: 'carriers',
    label: 'Kargo Firmaları',
    icon: <Business />,
    permission: 'read:carriers',
    children: [
      {
        id: 'all-carriers',
        label: 'Tüm Firmalar',
        icon: <Business />,
        path: '/carriers',
      },
      {
        id: 'carrier-integration',
        label: 'Entegrasyon Ayarları',
        icon: <Settings />,
        path: '/carriers/integration',
      },
    ],
  },
  {
    id: 'payments',
    label: 'Ödemeler',
    icon: <Payment />,
    permission: 'read:payments',
    children: [
      {
        id: 'transactions',
        label: 'İşlemler',
        icon: <Payment />,
        path: '/payments',
      },
      {
        id: 'commission',
        label: 'Komisyon Yönetimi',
        icon: <TrendingUp />,
        path: '/payments/commission',
      },
    ],
  },
  {
    id: 'reports',
    label: 'Raporlar',
    icon: <Assessment />,
    permission: 'read:reports',
    children: [
      {
        id: 'analytics',
        label: 'Analitik',
        icon: <TrendingUp />,
        path: '/reports/analytics',
      },
      {
        id: 'financial',
        label: 'Mali Raporlar',
        icon: <Payment />,
        path: '/reports/financial',
      },
      {
        id: 'performance',
        label: 'Performans',
        icon: <Assessment />,
        path: '/reports/performance',
      },
    ],
  },
  {
    id: 'notifications',
    label: 'Bildirimler',
    icon: <NotificationsActive />,
    path: '/notifications',
    badge: 3,
  },
  {
    id: 'settings',
    label: 'Ayarlar',
    icon: <Settings />,
    permission: 'write:settings',
    children: [
      {
        id: 'general-settings',
        label: 'Genel Ayarlar',
        icon: <Settings />,
        path: '/settings/general',
      },
      {
        id: 'system-settings',
        label: 'Sistem Ayarları',
        icon: <Security />,
        path: '/settings/system',
      },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, sidebarWidth, isMobile, setSidebarOpen } = useLayout();
  const { hasPermission } = usePermissions();

  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const handleItemClick = (item: MenuItem) => {
    if (item.children) {
      // Submenu toggle
      setExpandedItems(prev =>
        prev.includes(item.id)
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      );
    } else if (item.path) {
      // Navigate
      navigate(item.path);
      if (isMobile) {
        setSidebarOpen(false);
      }
    }
  };

  const isItemActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter(item => {
      if (item.permission && !hasPermission(item.permission)) {
        return false;
      }
      
      if (item.children) {
        item.children = filterMenuItems(item.children);
        return item.children.length > 0;
      }
      
      return true;
    });
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.id);
    const isActive = item.path ? isItemActive(item.path) : false;

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            sx={{
              pl: 2 + level * 1.5,
              pr: 2,
              py: 1,
              minHeight: 48,
              backgroundColor: isActive ? theme.palette.primary.main : 'transparent',
              color: isActive ? theme.palette.primary.contrastText : 'inherit',
              '&:hover': {
                backgroundColor: isActive 
                  ? theme.palette.primary.dark 
                  : theme.palette.action.hover,
              },
              borderRadius: sidebarOpen ? '0 24px 24px 0' : '8px',
              mx: sidebarOpen ? 0 : 1,
              mb: 0.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: isActive ? 'inherit' : theme.palette.text.secondary,
              }}
            >
              {item.badge ? (
                <Badge badgeContent={item.badge} color="error">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>

            {sidebarOpen && (
              <>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 400,
                  }}
                />

                {item.children && (
                  isExpanded ? <ExpandLess /> : <ExpandMore />
                )}
              </>
            )}
          </ListItemButton>
        </ListItem>

        {/* Submenu */}
        {item.children && sidebarOpen && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map(child => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const filteredMenuItems = filterMenuItems(menuItems);

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: sidebarWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {/* Logo & Brand */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          minHeight: 64,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'primary.main',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.25rem',
            fontWeight: 'bold',
          }}
        >
          CL
        </Box>
        
        {sidebarOpen && (
          <Box>
            <Typography variant="h6" color="primary" fontWeight={600}>
              CargoLink
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Admin Panel
            </Typography>
          </Box>
        )}
      </Box>

      {/* Menu Items */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List>
          {filteredMenuItems.map(item => renderMenuItem(item))}
        </List>
      </Box>

      {/* Footer */}
      {sidebarOpen && (
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            v1.0.0 • {new Date().getFullYear()}
          </Typography>
        </Box>
      )}
    </Drawer>
  );
};

export default Sidebar;
