import { validateLogin } from '@/features/auth/validate-login';

describe('validateLogin', () => {
  it('returns no errors for a valid email and a password of 6+ characters', () => {
    expect(validateLogin('test@example.com', 'password123')).toEqual({});
  });

  it.each(['not-an-email', 'missing-at-sign.com', 'two@@at.com', ''])(
    'flags %p as an invalid email',
    (email) => {
      const errors = validateLogin(email, 'password123');
      expect(errors.email).toBe('Enter a valid email address');
    }
  );

  it.each(['', '1', '12345'])('flags a password shorter than 6 characters (%p)', (password) => {
    const errors = validateLogin('test@example.com', password);
    expect(errors.password).toBe('Password must be at least 6 characters');
  });

  it('returns both errors when both fields are invalid', () => {
    const errors = validateLogin('not-an-email', '123');
    expect(errors).toEqual({
      email: 'Enter a valid email address',
      password: 'Password must be at least 6 characters',
    });
  });

  it('accepts a password exactly 6 characters long', () => {
    expect(validateLogin('test@example.com', '123456').password).toBeUndefined();
  });
});
