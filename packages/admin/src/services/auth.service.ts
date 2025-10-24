import axios from 'axios';
import { User, LoginRequest, AuthResponse } from '@shared/types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class AuthService {
  private baseURL: string;
  
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/auth`;
  }

  // Admin login
  async login(credentials: LoginRequest & { requireAdmin?: boolean }): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/login`, {
        ...credentials,
        platform: 'admin',
      });

      const { token, user } = response.data;

      // Admin yetkisi kontrolü
      if (credentials.requireAdmin && user.role !== 'ADMIN') {
        throw new Error('Admin yetkilerine sahip değilsiniz');
      }

      return { token, user };
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw error;
    }
  }

  // Mevcut kullanıcı bilgilerini al
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        return null;
      }

      const response = await axios.get(`${this.baseURL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.user;
    } catch (error: any) {
      console.error('Get current user error:', error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('admin_token');
      }
      
      throw error;
    }
  }

  // Token yenileme
  async refreshToken(): Promise<AuthResponse> {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No token available');
      }

      const response = await axios.post(`${this.baseURL}/refresh`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Refresh token error:', error);
      localStorage.removeItem('admin_token');
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('admin_token');
      if (token) {
        await axios.post(`${this.baseURL}/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error: any) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('admin_token');
    }
  }

  // Token geçerliliğini kontrol et
  isTokenValid(): boolean {
    const token = localStorage.getItem('admin_token');
    if (!token) return false;

    try {
      // JWT payload'ını decode et (basit kontrol)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  // Authorization header'ı al
  getAuthHeader(): { Authorization: string } | {} {
    const token = localStorage.getItem('admin_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export const authService = new AuthService();

// Axios interceptor - otomatik token ekleme ve hata yönetimi
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Token süresi dolmuşsa ve henüz retry yapılmamışsa
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const authResponse = await authService.refreshToken();
        localStorage.setItem('admin_token', authResponse.token);
        
        // Orijinal isteği yeniden dene
        originalRequest.headers.Authorization = `Bearer ${authResponse.token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh token da geçersizse login sayfasına yönlendir
        localStorage.removeItem('admin_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default authService;