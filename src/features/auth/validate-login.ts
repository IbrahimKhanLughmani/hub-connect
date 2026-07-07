const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LoginFormErrors = {
  email?: string;
  password?: string;
};

export function validateLogin(email: string, password: string): LoginFormErrors {
  const errors: LoginFormErrors = {};

  if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address';
  }
  if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
}
