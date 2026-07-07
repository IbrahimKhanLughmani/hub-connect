export enum ApiErrorKind {
  Network = 'network',
  NotFound = 'not-found',
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;

  constructor(kind: ApiErrorKind, message: string) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
  }
}
