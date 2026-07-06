import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants';
import { useTheme } from '@/hooks';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'title'
    | 'small'
    | 'smallBold'
    | 'subtitle'
    | 'eyebrow'
    | 'link'
    | 'linkPrimary'
    | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const defaultColor: ThemeColor =
    type === 'linkPrimary' || type === 'link'
      ? 'link'
      : type === 'eyebrow'
        ? 'textSecondary'
        : 'text';

  return (
    <Text
      style={[
        { color: theme[themeColor ?? defaultColor] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'eyebrow' && styles.eyebrow,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 600,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 400,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: 600,
  },
  eyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  link: {
    lineHeight: 20,
    fontSize: 14,
    fontWeight: 600,
  },
  linkPrimary: {
    lineHeight: 20,
    fontSize: 14,
    fontWeight: 600,
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
