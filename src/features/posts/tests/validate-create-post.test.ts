import { validateCreatePost } from '@/features/posts/validate-create-post';

describe('validateCreatePost', () => {
  it('returns no errors when title and body are both present', () => {
    expect(validateCreatePost('A title', 'Some body text')).toEqual({});
  });

  it('flags an empty title', () => {
    const errors = validateCreatePost('', 'Some body text');
    expect(errors.title).toBe('Title is required');
    expect(errors.body).toBeUndefined();
  });

  it('flags a whitespace-only title as empty', () => {
    const errors = validateCreatePost('   ', 'Some body text');
    expect(errors.title).toBe('Title is required');
  });

  it('flags an empty body', () => {
    const errors = validateCreatePost('A title', '');
    expect(errors.body).toBe('Body is required');
    expect(errors.title).toBeUndefined();
  });

  it('flags a whitespace-only body as empty', () => {
    const errors = validateCreatePost('A title', '   \n  ');
    expect(errors.body).toBe('Body is required');
  });

  it('returns both errors when both fields are empty', () => {
    expect(validateCreatePost('', '')).toEqual({
      title: 'Title is required',
      body: 'Body is required',
    });
  });
});
