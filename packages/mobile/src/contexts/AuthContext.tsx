import React, {createContext, useContext, useEffect, useState, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {User, LoginRequest, RegisterRequest} from '@cargolink/shared';
import {authApi} from '../services/api/auth';
import Toast from 'react-native-toast-message';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AUTH_STORAGE_KEY = 'auth_data';

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!tokens;

  // Load saved auth data on app start
  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      const savedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (savedAuth) {
        const {user: savedUser, tokens: savedTokens} = JSON.parse(savedAuth);
        setUser(savedUser);
        setTokens(savedTokens);
        
        // Verify token is still valid by getting fresh user data
        try {
          const freshUser = await authApi.getProfile(savedTokens.accessToken);
          setUser(freshUser);
        } catch (error) {
          // Token might be expired, try to refresh
          await refreshTokens();
        }
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuthData = async (userData: User, tokenData: AuthTokens) => {
    try {
      const authData = {
        user: userData,
        tokens: tokenData,
      };
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      setUser(userData);
      setTokens(tokenData);
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  };

  const clearAuthData = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      setTokens(null);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      
      // Mock authentication for demo - bypass API call
      if (credentials.email.includes('@') || credentials.email === 'demo') {
        const mockUser = {
          id: 'demo-user-id',
          email: credentials.email.includes('@') ? credentials.email : 'demo@cargolink.com',
          firstName: 'Ahmet',
          lastName: 'Yılmaz',
          role: 'customer',
          phone: '+90 555 123 45 67',
        } as User;

        const mockTokens: AuthTokens = {
          accessToken: 'demo-access-token',
          refreshToken: 'demo-refresh-token',
          expiresIn: 3600000, // 1 hour
        };

        await saveAuthData(mockUser, mockTokens);
        
        Toast.show({
          type: 'success',
          text1: 'Giriş başarılı',
          text2: 'CargoLink\'e hoş geldiniz!',
        });
        return;
      }

      // Real API call for production
      const response = await authApi.login(credentials);
      await saveAuthData(response.user, response.tokens);
      
      Toast.show({
        type: 'success',
        text1: 'Giriş başarılı',
        text2: 'CargoLink\'e hoş geldiniz!',
      });
    } catch (error: any) {
      console.error('Login error:', error);
      Toast.show({
        type: 'error',
        text1: 'Giriş hatası',
        text2: error.message || 'Giriş yapılamadı',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(data);
      
      // Auto-login after successful registration
      if (response.tokens) {
        await saveAuthData(response.user, response.tokens);
      }
      
      Toast.show({
        type: 'success',
        text1: 'Kayıt başarılı',
        text2: 'Hesabınız oluşturuldu!',
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      Toast.show({
        type: 'error',
        text1: 'Kayıt hatası',
        text2: error.message || 'Kayıt oluşturulamadı',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Call logout API if tokens exist
      if (tokens) {
        try {
          await authApi.logout(tokens.accessToken);
        } catch (error) {
          // Continue with local logout even if API call fails
          console.error('Logout API error:', error);
        }
      }
      
      await clearAuthData();
      
      Toast.show({
        type: 'info',
        text1: 'Çıkış yapıldı',
        text2: 'Güvenli bir şekilde çıkış yaptınız',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTokens = async () => {
    try {
      if (!tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const newTokens = await authApi.refreshToken(tokens.refreshToken);
      
      if (user) {
        await saveAuthData(user, newTokens);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout user
      await clearAuthData();
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    tokens,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshTokens,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};