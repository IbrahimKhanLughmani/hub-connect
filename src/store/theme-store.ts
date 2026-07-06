import { create } from 'zustand';

import { storage } from '@/lib';

export enum ThemePreference {
  Light = 'light',
  Dark = 'dark',
  System = 'system',
}

const THEME_PREFERENCE_KEY = 'theme-preference';

type ThemeStore = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

function isThemePreference(value: string): value is ThemePreference {
  return Object.values(ThemePreference).includes(value as ThemePreference);
}

const persistedPreference = storage.getString(THEME_PREFERENCE_KEY);
const initialPreference =
  persistedPreference && isThemePreference(persistedPreference)
    ? persistedPreference
    : ThemePreference.Light;

export const useThemeStore = create<ThemeStore>((set) => ({
  preference: initialPreference,
  setPreference: (preference) => {
    storage.set(THEME_PREFERENCE_KEY, preference);
    set({ preference });
  },
}));
