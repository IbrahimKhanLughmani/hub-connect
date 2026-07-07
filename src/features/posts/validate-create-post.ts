export type CreatePostFormErrors = {
  title?: string;
  body?: string;
};

export function validateCreatePost(title: string, body: string): CreatePostFormErrors {
  const errors: CreatePostFormErrors = {};

  if (title.trim().length === 0) {
    errors.title = 'Title is required';
  }
  if (body.trim().length === 0) {
    errors.body = 'Body is required';
  }

  return errors;
}
