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

export type AuthValidationError =
  | 'required'
  | 'invalid_email'
  | 'invalid_password';

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
  | 'invalid_signup'
  | 'email_not_confirmed'
  | 'rate_limited'
  | 'unavailable'
  | 'unknown';

export type NormalizedAuthError = Readonly<{
  category: AuthErrorCategory;
}>;

export type RegistrationInput = Readonly<{
  name: string;
  email: string;
  password: string;
}>;

export type RegistrationFieldErrors = Readonly<{
  name?: string;
  email?: string;
  password?: string;
}>;

export type RegistrationResult =
  | Readonly<{
      status: 'authenticated' | 'confirmation_required';
    }>
  | Readonly<{
      status: 'invalid';
      fieldErrors: RegistrationFieldErrors;
    }>
  | Readonly<{
      status: 'error';
      category: AuthErrorCategory;
    }>;

export type RegistrationActionState =
  | Readonly<{ status: 'idle' }>
  | RegistrationResult;
