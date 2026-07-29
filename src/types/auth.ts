export type AuthenticatedIdentity = Readonly<{
  userId: string;
  email: string | null;
}>;

export type AuthIdentityResult =
  | Readonly<{
      status: 'authenticated';
      identity: AuthenticatedIdentity;
    }>
  | Readonly<{
      status: 'anonymous';
      identity: null;
    }>;

export type AuthValidationError = 'required' | 'invalid_email';

export type AuthValidationResult<T> =
  | Readonly<{
      valid: true;
      value: T;
    }>
  | Readonly<{
      valid: false;
      error: AuthValidationError;
    }>;

export type AuthErrorCategory =
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'rate_limited'
  | 'unavailable'
  | 'unknown';

export type NormalizedAuthError = Readonly<{
  category: AuthErrorCategory;
}>;
