import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { LayoutProvider } from './contexts/LayoutContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ShipmentsPage } from './pages/shipments/ShipmentsPage';
import { UsersPage } from './pages/users/UsersPage';
import { CarriersPage } from './pages/carriers/CarriersPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { SettingsPage } from './pages/settings/SettingsPage';

// Premium CargoLink Enterprise Theme
const theme = createTheme({
  palette: {
    mode: 'light',
    // Premium CargoLink Brand Colors
    primary: {
      main: '#0066FF', // CargoLink Electric Blue
      light: '#60a5fa',
      dark: '#0052CC',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8B5CF6', // Premium Purple
      light: '#A78BFA',
      dark: '#7C3AED',
      contrastText: '#ffffff',
    },
    // Enterprise Color System
    success: {
      main: '#10B981', // Emerald Green
      light: '#34D399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    error: {
      main: '#EF4444', // Modern Red
      light: '#F87171',
      dark: '#DC2626',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#F59E0B', // Amber
      light: '#FBBF24',
      dark: '#D97706',
      contrastText: '#000000',
    },
    info: {
      main: '#06B6D4', // Cyan
      light: '#22D3EE',
      dark: '#0891B2',
      contrastText: '#ffffff',
    },
    // Premium Background System
    background: {
      default: '#F8FAFC', // Premium light gray
      paper: '#FFFFFF',
    },
    // Advanced Gray Scale
    grey: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
  },
  // Premium Typography System
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700, // Bolder for enterprise
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    // Enhanced body text
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      fontWeight: 400,
    },
  },
  // Premium Shape System
  shape: {
    borderRadius: 12, // More modern rounded corners
  },
  // Premium Component Overrides
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '8px',
          padding: '8px 16px',
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #0066FF 0%, #0052CC 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0052CC 0%, #003D99 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
            borderColor: '#CBD5E1',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#334155',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          borderBottom: '1px solid #E2E8F0',
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
          fontSize: '0.75rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
        },
        elevation3: {
          boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <LayoutProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard Ana Sayfa */}
              <Route index element={<DashboardPage />} />
              
              {/* Gönderiler Yönetimi */}
              <Route path="shipments" element={<ShipmentsPage />} />
              <Route path="shipments/:id" element={<ShipmentsPage />} />
              
              {/* Kullanıcı Yönetimi */}
              <Route path="users" element={<UsersPage />} />
              <Route path="users/:id" element={<UsersPage />} />
              
              {/* Kargo Firmaları */}
              <Route path="carriers" element={<CarriersPage />} />
              <Route path="carriers/:id" element={<CarriersPage />} />
              
              {/* Raporlar ve Analizler */}
              <Route path="reports" element={<ReportsPage />} />
              <Route path="reports/:type" element={<ReportsPage />} />
              
              {/* Sistem Ayarları */}
              <Route path="settings" element={<SettingsPage />} />
              <Route path="settings/:section" element={<SettingsPage />} />
            </Route>
            
            {/* Fallback Routes */}
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LayoutProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;