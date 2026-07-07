import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { useAuthStore } from '@/features/auth/store';
import { validateLogin, type LoginFormErrors } from '@/features/auth/validate-login';
import { Button, ThemedText, ThemedTextInput, ThemedView } from '@/shared/components';
import { useTheme } from '@/shared/hooks';
import { Radius, Spacing } from '@/shared/styles';

export function LoginScreen() {
  const theme = useTheme();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginFormErrors>({});

  function handleSubmit() {
    const nextErrors = validateLogin(email, password);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      login(`mock-token-${email}`, email);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.hero}>
        <ThemedView style={[styles.mark, { backgroundColor: theme.accent }]}>
          <ThemedText type="title" themeColor="onAccent">
            H
          </ThemedText>
        </ThemedView>
        <ThemedText type="eyebrow" themeColor="textSecondary">
          Community Hub
        </ThemedText>
        <ThemedText type="title">Welcome back</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.heroSubtitle}>
          Sign in to browse and manage your communities.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.form}>
        <ThemedTextInput
          icon="mail-outline"
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <ThemedTextInput
          icon="lock-closed-outline"
          isPassword
          label="Password"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          placeholder="••••••••"
        />
        <Button label="Log in" onPress={handleSubmit} />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  mark: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    textAlign: 'center',
  },
  form: {
    gap: Spacing.lg,
  },
});
