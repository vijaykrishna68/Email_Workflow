import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api', // ✅ Use proxy for dev
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // ✅ Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const tokenData = localStorage.getItem('auth-storage');
        if (tokenData) {
          try {
            const authStorage = JSON.parse(tokenData);

            // ✅ CHANGE: Read from top-level, not `.state`
            const token = authStorage?.accessToken;
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (error) {
            console.error('Error parsing auth token:', error);
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // ✅ Response interceptor for refresh logic
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const tokenData = localStorage.getItem('auth-storage');
            if (tokenData) {
              const authData = JSON.parse(tokenData);

              if (authData?.refreshToken) {
                const refreshResponse = await this.post('/auth/refresh-token', {
                  refreshToken: authData.refreshToken,
                });

                const newToken = refreshResponse.data.data.accessToken;
                originalRequest.headers.Authorization = `Bearer ${newToken}`;

                // ✅ Update stored token
                const updatedAuthData = {
                  ...authData,
                  accessToken: newToken,
                };
                localStorage.setItem('auth-storage', JSON.stringify(updatedAuthData));

                return this.client(originalRequest);
              }
            }
          } catch (refreshError) {
            console.error('❌ Refresh token failed:', refreshError);
            localStorage.removeItem('auth-storage');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.put(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.delete(url, config);
  }
}

export const apiClient = new ApiClient();
