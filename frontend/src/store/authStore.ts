import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginCredentials, RegisterData } from '../types';
import { authService, googleOAuthCallback } from '../services/authService'; // ✅ CHANGE: combined import

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: User, accessToken?: string, refreshToken?: string) => void; // ✅ CHANGE
  loginWithGoogle: (code: string) => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(data);
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed',
          });
          throw error;
        }
      },

      logout: () => {
        const { refreshToken } = get();
        if (refreshToken) {
          authService.logout(refreshToken).catch(console.error);
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          error: null,
        });
      },

      checkAuth: async () => {
        const { accessToken, refreshToken } = get();
        if (!accessToken || !refreshToken) {
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await authService.getProfile();
          set({
            user: response.user,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          try {
            const refreshResponse = await authService.refreshToken(refreshToken);
            set({
              accessToken: refreshResponse.accessToken,
              isLoading: false,
              error: null,
            });
            const profileResponse = await authService.getProfile();
            set({ user: profileResponse.user });
          } catch {
            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              isLoading: false,
              error: null,
            });
          }
        }
      },

      clearError: () => set({ error: null }),

      // ✅ CHANGE: updateUser now also supports tokens
      updateUser: (user: User, accessToken?: string, refreshToken?: string) =>
        set((state) => ({
          user,
          accessToken: accessToken ?? state.accessToken,
          refreshToken: refreshToken ?? state.refreshToken,
        })),

      loginWithGoogle: async (code: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await googleOAuthCallback(code);
          if (response.success) {
            set({
              user: response.data.user,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error('Google OAuth failed');
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Google OAuth failed',
          });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
