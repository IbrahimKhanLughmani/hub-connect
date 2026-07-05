import { Platform } from 'react-native';

export interface Theme {
  readonly text: string;
  readonly background: string;
  readonly backgroundElement: string;
  readonly backgroundSelected: string;
  readonly textSecondary: string;
  readonly link: string;
  readonly error: string;
}

export const Colors: Readonly<Record<'light' | 'dark', Theme>> = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    link: '#3c87f7',
    error: '#D92D20',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    link: '#3c87f7',
    error: '#D92D20',
  },
};

export type ThemeColor = keyof Theme;

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
