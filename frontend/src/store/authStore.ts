import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '../services/authService';

interface User {
  id: number;
  sub?: number;
  email: string;
  role: string;
  profile?: any;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (token: string) => {
        localStorage.setItem('access_token', token);
        try {
          const userData = await authService.getCurrentUser();
          set({ user: userData, isAuthenticated: true });
        } catch (err) {
          console.error("Failed to load user");
          get().logout();
        }
      },

      logout: () => {
        localStorage.removeItem('access_token');
        set({ user: null, isAuthenticated: false });
      },

      loadUser: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        try {
          const userData = await authService.getCurrentUser();
          set({ user: userData, isAuthenticated: true });
        } catch (err) {
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);