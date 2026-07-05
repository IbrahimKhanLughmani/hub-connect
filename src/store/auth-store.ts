import { create } from 'zustand';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  status: 'unauthenticated',
  token: null,
  login: (token) => set({ status: 'authenticated', token }),
  logout: () => set({ status: 'unauthenticated', token: null }),
}));
