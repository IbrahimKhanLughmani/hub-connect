import { create } from 'zustand';

import { storage } from '@/lib';

export enum AuthStatus {
  Authenticated = 'authenticated',
  Unauthenticated = 'unauthenticated',
}

const TOKEN_KEY = 'auth-token';
const EMAIL_KEY = 'auth-email';

type AuthState = {
  status: AuthStatus;
  token: string | null;
  email: string | null;
  login: (token: string, email: string) => void;
  logout: () => void;
};

const persistedToken = storage.getString(TOKEN_KEY) ?? null;
const persistedEmail = storage.getString(EMAIL_KEY) ?? null;

export const useAuthStore = create<AuthState>((set) => ({
  status: persistedToken ? AuthStatus.Authenticated : AuthStatus.Unauthenticated,
  token: persistedToken,
  email: persistedEmail,
  login: (token, email) => {
    storage.set(TOKEN_KEY, token);
    storage.set(EMAIL_KEY, email);
    set({ status: AuthStatus.Authenticated, token, email });
  },
  logout: () => {
    storage.remove(TOKEN_KEY);
    storage.remove(EMAIL_KEY);
    set({ status: AuthStatus.Unauthenticated, token: null, email: null });
  },
}));
