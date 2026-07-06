import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Button, ThemedText, ThemedTextInput, ThemedView } from '@/components';
import { Radius, Spacing } from '@/constants';
import { useTheme } from '@/hooks';
import { useAuthStore } from '@/store';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormErrors = {
  email?: string;
  password?: string;
};

function validate(email: string, password: string): FormErrors {
  const errors: FormErrors = {};

  if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address';
  }
  if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
}

export default function LoginScreen() {
  const theme = useTheme();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  function handleSubmit() {
    const nextErrors = validate(email, password);
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
