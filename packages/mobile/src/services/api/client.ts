import axios, {AxiosInstance, AxiosError} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import {Alert} from 'react-native';

// API yapılandırması
const API_BASE_URL = Config.API_BASE_URL || 'http://localhost:3001/api';
const API_TIMEOUT = 30000; // 30 saniye

// API istemci örneği oluştur
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Token yönetimi için yardımcı fonksiyonlar
export const tokenManager = {
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('access_token');
    } catch (error) {
      console.error('Access token alınamadı:', error);
      return null;
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('refresh_token');
    } catch (error) {
      console.error('Refresh token alınamadı:', error);
      return null;
    }
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        ['access_token', accessToken],
        ['refresh_token', refreshToken],
      ]);
    } catch (error) {
      console.error('Token kaydetme hatası:', error);
    }
  },

  async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    } catch (error) {
      console.error('Token temizleme hatası:', error);
    }
  },
};

// Request interceptor - otomatik token ekleme
apiClient.interceptors.request.use(
  async (config) => {
    const token = await tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Request logging (development only)
    if (__DEV__) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor hatası:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - otomatik token yenileme
apiClient.interceptors.response.use(
  (response) => {
    // Response logging (development only)
    if (__DEV__) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // Response error logging
    if (__DEV__) {
      console.error(`❌ API Error: ${error.response?.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        error: error.response?.data,
        message: error.message,
      });
    }

    // 401 Unauthorized - token yenilemeyi dene
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await tokenManager.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const {accessToken, refreshToken: newRefreshToken} = response.data.data.tokens;
          await tokenManager.setTokens(accessToken, newRefreshToken);

          // Orijinal isteği yeni token ile yeniden dene
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token yenileme hatası:', refreshError);
        await tokenManager.clearTokens();
        // Kullanıcıyı login ekranına yönlendir
        // Bu navigation logic'i context'te handle edilecek
      }
    }

    // 403 Forbidden
    if (error.response?.status === 403) {
      Alert.alert(
        'Erişim Engellendi',
        'Bu işlem için yeterli yetkiniz bulunmamaktadır.',
        [{text: 'Tamam', style: 'default'}]
      );
    }

    // 404 Not Found
    if (error.response?.status === 404) {
      Alert.alert(
        'Bulunamadı',
        'İstenen kaynak bulunamadı.',
        [{text: 'Tamam', style: 'default'}]
      );
    }

    // 500 Server Error
    if (error.response?.status && error.response.status >= 500) {
      Alert.alert(
        'Sunucu Hatası',
        'Bir sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.',
        [{text: 'Tamam', style: 'default'}]
      );
    }

    // Network Error
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      Alert.alert(
        'Bağlantı Hatası',
        'İnternet bağlantınızı kontrol edin ve tekrar deneyin.',
        [{text: 'Tamam', style: 'default'}]
      );
    }

    // Timeout Error
    if (error.code === 'ECONNABORTED') {
      Alert.alert(
        'Zaman Aşımı',
        'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.',
        [{text: 'Tamam', style: 'default'}]
      );
    }

    return Promise.reject(error);
  }
);

// API yanıt tipleri için yardımcı tipler
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// HTTP status kodları
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API endpoint'leri
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    VERIFY_PHONE: '/auth/verify-phone',
  },
  SHIPMENTS: {
    LIST: '/shipments',
    CREATE: '/shipments',
    DETAIL: (id: string) => `/shipments/${id}`,
    TRACK: (id: string) => `/shipments/${id}/track`,
    CANCEL: (id: string) => `/shipments/${id}/cancel`,
    QUOTES: '/shipments/quotes',
  },
  CARRIERS: {
    LIST: '/carriers',
    RATES: '/carriers/rates',
  },
  PAYMENTS: {
    CREATE: '/payments',
    VERIFY: '/payments/verify',
    HISTORY: '/payments/history',
  },
  UPLOAD: {
    IMAGE: '/upload/image',
    DOCUMENT: '/upload/document',
  },
} as const;

export default apiClient;