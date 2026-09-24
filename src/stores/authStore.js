import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,

  // Check if user is authenticated via session
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`);
      if (res.ok) {
        const user = await res.json();
        set({ user, isLoading: false });
      } else {
        throw new Error('Unauthorized');
      }
    } catch (err) {
      set({ user: null, error: err.message, isLoading: false });
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`);
      set({ user: null, accessToken: null, error: null });
      window.location.href = '/';
    } catch (err) {
      set({ error: err.message });
    }
  },
}));
