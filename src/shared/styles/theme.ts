import { Platform } from 'react-native';

export interface Theme {
  readonly text: string;
  readonly textSecondary: string;
  readonly background: string;
  readonly surface: string;
  readonly surfaceSelected: string;
  readonly border: string;
  readonly accent: string;
  readonly onAccent: string;
  readonly onError: string;
  readonly link: string;
  readonly error: string;
  readonly overlay: string;
  readonly backdrop: string;
  readonly shadow: string;
}

export const Colors: Readonly<Record<'light' | 'dark', Theme>> = {
  light: {
    text: '#16212B',
    textSecondary: '#5C6B77',
    background: '#F7F9FB',
    surface: '#FFFFFF',
    surfaceSelected: '#E8EEF3',
    border: '#DCE4EA',
    accent: '#1E4B6E',
    onAccent: '#FFFFFF',
    onError: '#FFFFFF',
    link: '#1E4B6E',
    error: '#C0392B',
    overlay: 'rgba(0, 0, 0, 0.15)',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    shadow: '#000000',
  },
  dark: {
    text: '#EDF2F5',
    textSecondary: '#9AA8B2',
    background: '#0F1418',
    surface: '#1A2128',
    surfaceSelected: '#20303D',
    border: '#2C3A44',
    accent: '#5B9BD5',
    onAccent: '#FFFFFF',
    onError: '#FFFFFF',
    link: '#5B9BD5',
    error: '#E5675F',
    overlay: 'rgba(0, 0, 0, 0.15)',
    backdrop: 'rgba(0, 0, 0, 0.6)',
    shadow: '#000000',
  },
};

export type ThemeColor = keyof Theme;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});
