import { create } from 'zustand';

import { storage } from '@/lib/storage';

export enum AuthStatus {
  Authenticated = 'authenticated',
  Unauthenticated = 'unauthenticated',
}

const TOKEN_KEY = 'auth-token';

type AuthState = {
  status: AuthStatus;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
};

const persistedToken = storage.getString(TOKEN_KEY) ?? null;

export const useAuthStore = create<AuthState>((set) => ({
  status: persistedToken ? AuthStatus.Authenticated : AuthStatus.Unauthenticated,
  token: persistedToken,
  login: (token) => {
    storage.set(TOKEN_KEY, token);
    set({ status: AuthStatus.Authenticated, token });
  },
  logout: () => {
    storage.remove(TOKEN_KEY);
    set({ status: AuthStatus.Unauthenticated, token: null });
  },
}));
