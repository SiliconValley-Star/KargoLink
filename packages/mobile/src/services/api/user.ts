import {apiClient, ApiResponse, API_ENDPOINTS} from './client';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: string;
  role: 'user' | 'admin' | 'carrier';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  preferences: UserPreferences;
  addresses: SavedAddress[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface UserPreferences {
  language: 'tr' | 'en';
  currency: 'TRY' | 'USD' | 'EUR';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  timezone: string;
}

export interface SavedAddress {
  id: string;
  name: string;
  type: 'home' | 'work' | 'other';
  contactName: string;
  phone: string;
  email?: string;
  street: string;
  city: string;
  district: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserStats {
  totalShipments: number;
  activeShipments: number;
  deliveredShipments: number;
  cancelledShipments: number;
  totalSpent: number;
  monthlySavings: number;
  averageDeliveryTime: number;
  favoriteCarrier?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  name: string;
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: string;
}

// User Service Class
class UserService {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
      return response.data;
    } catch (error: any) {
      console.error('Profil alma hatası:', error);
      throw new Error(error.response?.data?.message || 'Profil bilgileri alınamadı');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.put(API_ENDPOINTS.AUTH.PROFILE, data);
      return response.data;
    } catch (error: any) {
      console.error('Profil güncelleme hatası:', error);
      throw new Error(error.response?.data?.message || 'Profil güncellenemedi');
    }
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<{success: boolean}>> {
    try {
      const response = await apiClient.post('/users/change-password', data);
      return response.data;
    } catch (error: any) {
      console.error('Şifre değiştirme hatası:', error);
      throw new Error(error.response?.data?.message || 'Şifre değiştirilemedi');
    }
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(file: FormData): Promise<ApiResponse<{avatarUrl: string}>> {
    try {
      const response = await apiClient.post('/users/avatar', file, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Avatar yükleme hatası:', error);
      throw new Error(error.response?.data?.message || 'Avatar yüklenemedi');
    }
  }

  /**
   * Get user statistics
   */
  async getStats(): Promise<ApiResponse<UserStats>> {
    try {
      const response = await apiClient.get('/users/stats');
      return response.data;
    } catch (error: any) {
      console.error('İstatistik alma hatası:', error);
      throw new Error(error.response?.data?.message || 'İstatistikler alınamadı');
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    try {
      const response = await apiClient.put('/users/preferences', preferences);
      return response.data;
    } catch (error: any) {
      console.error('Tercihler güncelleme hatası:', error);
      throw new Error(error.response?.data?.message || 'Tercihler güncellenemedi');
    }
  }

  /**
   * Get saved addresses
   */
  async getAddresses(): Promise<ApiResponse<SavedAddress[]>> {
    try {
      const response = await apiClient.get('/users/addresses');
      return response.data;
    } catch (error: any) {
      console.error('Adresler alma hatası:', error);
      throw new Error(error.response?.data?.message || 'Adresler alınamadı');
    }
  }

  /**
   * Add new address
   */
  async addAddress(address: Omit<SavedAddress, 'id' | 'createdAt'>): Promise<ApiResponse<SavedAddress>> {
    try {
      const response = await apiClient.post('/users/addresses', address);
      return response.data;
    } catch (error: any) {
      console.error('Adres ekleme hatası:', error);
      throw new Error(error.response?.data?.message || 'Adres eklenemedi');
    }
  }

  /**
   * Update address
   */
  async updateAddress(
    addressId: string,
    address: Partial<Omit<SavedAddress, 'id' | 'createdAt'>>
  ): Promise<ApiResponse<SavedAddress>> {
    try {
      const response = await apiClient.put(`/users/addresses/${addressId}`, address);
      return response.data;
    } catch (error: any) {
      console.error('Adres güncelleme hatası:', error);
      throw new Error(error.response?.data?.message || 'Adres güncellenemedi');
    }
  }

  /**
   * Delete address
   */
  async deleteAddress(addressId: string): Promise<ApiResponse<{success: boolean}>> {
    try {
      const response = await apiClient.delete(`/users/addresses/${addressId}`);
      return response.data;
    } catch (error: any) {
      console.error('Adres silme hatası:', error);
      throw new Error(error.response?.data?.message || 'Adres silinemedi');
    }
  }

  /**
   * Set default address
   */
  async setDefaultAddress(addressId: string): Promise<ApiResponse<{success: boolean}>> {
    try {
      const response = await apiClient.post(`/users/addresses/${addressId}/set-default`);
      return response.data;
    } catch (error: any) {
      console.error('Varsayılan adres ayarlama hatası:', error);
      throw new Error(error.response?.data?.message || 'Varsayılan adres ayarlanamadı');
    }
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    try {
      const response = await apiClient.get('/users/payment-methods');
      return response.data;
    } catch (error: any) {
      console.error('Ödeme yöntemleri alma hatası:', error);
      throw new Error(error.response?.data?.message || 'Ödeme yöntemleri alınamadı');
    }
  }

  /**
   * Add payment method
   */
  async addPaymentMethod(paymentData: {
    type: 'card' | 'bank_account';
    token: string;
    name?: string;
    setAsDefault?: boolean;
  }): Promise<ApiResponse<PaymentMethod>> {
    try {
      const response = await apiClient.post('/users/payment-methods', paymentData);
      return response.data;
    } catch (error: any) {
      console.error('Ödeme yöntemi ekleme hatası:', error);
      throw new Error(error.response?.data?.message || 'Ödeme yöntemi eklenemedi');
    }
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(paymentMethodId: string): Promise<ApiResponse<{success: boolean}>> {
    try {
      const response = await apiClient.delete(`/users/payment-methods/${paymentMethodId}`);
      return response.data;
    } catch (error: any) {
      console.error('Ödeme yöntemi silme hatası:', error);
      throw new Error(error.response?.data?.message || 'Ödeme yöntemi silinemedi');
    }
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<ApiResponse<{success: boolean}>> {
    try {
      const response = await apiClient.post(`/users/payment-methods/${paymentMethodId}/set-default`);
      return response.data;
    } catch (error: any) {
      console.error('Varsayılan ödeme yöntemi ayarlama hatası:', error);
      throw new Error(error.response?.data?.message || 'Varsayılan ödeme yöntemi ayarlanamadı');
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<ApiResponse<{success: boolean}>> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {token});
      return response.data;
    } catch (error: any) {
      console.error('Email doğrulama hatası:', error);
      throw new Error(error.response?.data?.message || 'Email doğrulanamadı');
    }
  }

  /**
   * Verify phone
   */
  async verifyPhone(code: string): Promise<ApiResponse<{success: boolean}>> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_PHONE, {code});
      return response.data;
    } catch (error: any) {
      console.error('Telefon doğrulama hatası:', error);
      throw new Error(error.response?.data?.message || 'Telefon doğrulanamadı');
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(): Promise<ApiResponse<{success: boolean}>> {
    try {
      const response = await apiClient.post('/users/resend-email-verification');
      return response.data;
    } catch (error: any) {
      console.error('Email doğrulama gönderme hatası:', error);
      throw new Error(error.response?.data?.message || 'Doğrulama emaili gönderilemedi');
    }
  }

  /**
   * Resend verification SMS
   */
  async resendVerificationSMS(): Promise<ApiResponse<{success: boolean}>> {
    try {
      const response = await apiClient.post('/users/resend-sms-verification');
      return response.data;
    } catch (error: any) {
      console.error('SMS doğrulama gönderme hatası:', error);
      throw new Error(error.response?.data?.message || 'Doğrulama SMS\'i gönderilemedi');
    }
  }

  /**
   * Delete account
   */
  async deleteAccount(password: string, reason?: string): Promise<ApiResponse<{success: boolean}>> {
    try {
      const response = await apiClient.post('/users/delete-account', {
        password,
        reason,
      });
      return response.data;
    } catch (error: any) {
      console.error('Hesap silme hatası:', error);
      throw new Error(error.response?.data?.message || 'Hesap silinemedi');
    }
  }

  /**
   * Export user data (GDPR)
   */
  async exportData(): Promise<ApiResponse<{downloadUrl: string; expiresAt: string}>> {
    try {
      const response = await apiClient.post('/users/export-data');
      return response.data;
    } catch (error: any) {
      console.error('Veri dışa aktarma hatası:', error);
      throw new Error(error.response?.data?.message || 'Veriler dışa aktarılamadı');
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings: UserPreferences['notifications']): Promise<ApiResponse<{success: boolean}>> {
    try {
      const response = await apiClient.put('/users/notification-settings', settings);
      return response.data;
    } catch (error: any) {
      console.error('Bildirim ayarları güncelleme hatası:', error);
      throw new Error(error.response?.data?.message || 'Bildirim ayarları güncellenemedi');
    }
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;