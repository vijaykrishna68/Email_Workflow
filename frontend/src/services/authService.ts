import { apiClient } from './api';
import { LoginCredentials, RegisterData, AuthResponse, User, UpdateUserData } from '../types';

export const googleOAuthCallback = async (code: string) => {
  const response = await apiClient.get(`/auth/google/callback?code=${code}`);
  return response.data;
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data.data!;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data.data!;
  },

  async getProfile(): Promise<{ user: User }> {
    const response = await apiClient.get<{ user: User }>('/auth/profile');
    return response.data.data!;
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await apiClient.post<{ accessToken: string }>('/auth/refresh-token', {
      refreshToken,
    });
    return response.data.data!;
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  async updateProfile(data: UpdateUserData): Promise<{ user: User }> {
    const response = await apiClient.put<{ user: User }>('/users/profile', data);
    return response.data.data!;
  },

  async deleteProfile(): Promise<void> {
    await apiClient.delete('/users/profile');
  },
};
