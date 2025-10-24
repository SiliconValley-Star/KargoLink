import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@shared/types/auth';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (token) {
        // DEMO: Mock admin user for design showcase
        const mockAdminUser = {
          id: '1',
          email: 'admin@cargolink.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin' as UserRole
        } as User;
        setUser(mockAdminUser);
      }
    } catch (error: any) {
      console.error('Auth initialization error:', error);
      localStorage.removeItem('admin_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // DEMO: Mock login for design showcase
      if (email === 'admin@cargolink.com' && password === 'admin123') {
        const mockAdminUser = {
          id: '1',
          email: 'admin@cargolink.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin' as UserRole
        } as User;

        localStorage.setItem('admin_token', 'mock_token_123');
        setUser(mockAdminUser);
        toast.success(`Hoş geldiniz, ${mockAdminUser.firstName}!`);
        return;
      }
      
      // For demo purposes, accept any credentials
      const mockAdminUser = {
        id: '1',
        email: email,
        firstName: 'Admin',
        lastName: 'Demo',
        role: 'admin' as UserRole
      } as User;

      localStorage.setItem('admin_token', 'mock_token_123');
      setUser(mockAdminUser);
      toast.success(`Hoş geldiniz, ${mockAdminUser.firstName}!`);
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Giriş yapılamadı');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setUser(null);
    toast.success('Çıkış yapıldı');
    window.location.href = '/login';
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const response = await authService.refreshToken();
      localStorage.setItem('admin_token', response.token);
      setUser(response.user);
    } catch (error: any) {
      console.error('Token refresh error:', error);
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Admin-specific hooks
export const useAdminAuth = () => {
  const auth = useAuth();
  
  if (!auth.isAuthenticated || auth.user?.role !== 'admin') {
    throw new Error('Admin authentication required');
  }
  
  return {
    ...auth,
    user: auth.user!,
  };
};

// Permission checker
export const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = (permission: string): boolean => {
    if (!user || user.role !== 'admin') return false;
    
    // Admin'ler için temel yetki kontrolü
    const adminPermissions = [
      'read:shipments',
      'write:shipments',
      'delete:shipments',
      'read:users',
      'write:users',
      'delete:users',
      'read:carriers',
      'write:carriers',
      'read:reports',
      'write:settings',
      'read:analytics',
    ];
    
    return adminPermissions.includes(permission);
  };

  const canManageShipments = () => hasPermission('write:shipments');
  const canManageUsers = () => hasPermission('write:users');
  const canManageCarriers = () => hasPermission('write:carriers');
  const canViewReports = () => hasPermission('read:reports');
  const canManageSettings = () => hasPermission('write:settings');

  return {
    hasPermission,
    canManageShipments,
    canManageUsers,
    canManageCarriers,
    canViewReports,
    canManageSettings,
  };
};