import { Component, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { Button } from '@/shared/components/button';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/styles';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <ThemedView style={styles.container}>
          <ThemedText type="eyebrow" themeColor="error">
            Error
          </ThemedText>
          <ThemedText type="subtitle">Something went wrong</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.message}>
            {this.state.error.message}
          </ThemedText>
          <Button variant="secondary" label="Try again" onPress={this.handleReset} />
        </ThemedView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.xl,
  },
  message: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
});
