import {User, LoginRequest, RegisterRequest} from '@cargolink/shared';
import {apiClient} from './client';
import {AuthTokens} from '../../contexts/AuthContext';

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  sessionId: string;
}

export interface RegisterResponse {
  user: User;
  tokens?: AuthTokens;
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  async logout(accessToken: string): Promise<void> {
    await apiClient.post('/auth/logout', {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await apiClient.post<{data: {tokens: AuthTokens}}>('/auth/refresh', {
      refreshToken,
    });
    return response.data.data.tokens;
  },

  async getProfile(accessToken: string): Promise<User> {
    const response = await apiClient.get<{data: {user: User}}>('/auth/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.data.user;
  },

  async updateProfile(accessToken: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.put<{data: {user: User}}>('/auth/profile', data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.data.user;
  },

  async changePassword(accessToken: string, currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', {email});
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    });
  },

  async verifyEmail(token: string): Promise<void> {
    await apiClient.post('/auth/verify-email', {token});
  },

  async verifyPhone(userId: string, code: string): Promise<void> {
    await apiClient.post('/auth/verify-phone', {userId, code});
  },

  async resendVerification(type: 'email' | 'phone', accessToken: string): Promise<void> {
    await apiClient.post(`/auth/resend-${type}-verification`, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
};