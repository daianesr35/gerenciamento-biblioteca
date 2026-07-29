import type {
  AuthErrorCategory,
  AuthValidationResult,
  LoginInput,
  LoginResult,
  NormalizedAuthError,
  RegistrationInput,
  RegistrationResult,
} from '@/types/auth';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MINIMUM_PASSWORD_LENGTH = 6;

const AUTH_ERROR_CODE_MAP: Readonly<Record<string, AuthErrorCategory>> = {
  invalid_credentials: 'invalid_credentials',
  email_exists: 'invalid_signup',
  user_already_exists: 'invalid_signup',
  weak_password: 'invalid_signup',
  signup_disabled: 'invalid_signup',
  email_not_confirmed: 'email_not_confirmed',
  over_email_send_rate_limit: 'rate_limited',
  over_request_rate_limit: 'rate_limited',
  request_timeout: 'unavailable',
  database_timeout: 'unavailable',
  unexpected_failure: 'unavailable',
};

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function hasRequiredValue(value: string): boolean {
  return value.trim().length > 0;
}

export function validateEmail(value: string): AuthValidationResult<string> {
  const normalized = normalizeEmail(value);

  if (!hasRequiredValue(normalized)) {
    return { valid: false, error: 'required' };
  }

  if (!EMAIL_PATTERN.test(normalized)) {
    return { valid: false, error: 'invalid_email' };
  }

  return { valid: true, value: normalized };
}

export function validateName(value: string): AuthValidationResult<string> {
  const normalized = normalizeName(value);

  if (!hasRequiredValue(normalized)) {
    return { valid: false, error: 'required' };
  }

  return { valid: true, value: normalized };
}

export function validatePassword(value: string): AuthValidationResult<string> {
  if (!hasRequiredValue(value)) {
    return { valid: false, error: 'required' };
  }

  if (value.length < MINIMUM_PASSWORD_LENGTH) {
    return { valid: false, error: 'invalid_password' };
  }

  return { valid: true, value };
}

function readErrorCode(error: unknown): string | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code;
  }

  return undefined;
}

export function normalizeAuthError(error: unknown): NormalizedAuthError {
  const code = readErrorCode(error);
  const category = code ? (AUTH_ERROR_CODE_MAP[code] ?? 'unknown') : 'unknown';

  return { category };
}

type SignUp = (input: RegistrationInput) => Promise<void>;

export async function registerOwner(
  input: RegistrationInput,
  signUp: SignUp,
): Promise<RegistrationResult> {
  const name = validateName(input.name);
  const email = validateEmail(input.email);
  const password = validatePassword(input.password);
  const fieldErrors = {
    ...(!name.valid && {
      name: 'Informe seu nome.',
    }),
    ...(!email.valid && {
      email:
        email.error === 'invalid_email'
          ? 'Informe um e-mail válido.'
          : 'Informe seu e-mail.',
    }),
    ...(!password.valid && {
      password:
        password.error === 'invalid_password'
          ? `A senha deve ter pelo menos ${MINIMUM_PASSWORD_LENGTH} caracteres.`
          : 'Informe uma senha.',
    }),
  };

  if (!name.valid || !email.valid || !password.valid) {
    return { status: 'invalid', fieldErrors };
  }

  try {
    await signUp({
      name: name.value,
      email: email.value,
      password: password.value,
    });

    return { status: 'registered' };
  } catch (error) {
    return {
      status: 'error',
      category: normalizeAuthError(error).category,
    };
  }
}

type SignIn = (input: LoginInput) => Promise<void>;

export async function loginOwner(
  input: LoginInput,
  signIn: SignIn,
): Promise<LoginResult> {
  const email = validateEmail(input.email);
  const hasPassword = hasRequiredValue(input.password);
  const fieldErrors = {
    ...(!email.valid && {
      email:
        email.error === 'invalid_email'
          ? 'Informe um e-mail válido.'
          : 'Informe seu e-mail.',
    }),
    ...(!hasPassword && {
      password: 'Informe sua senha.',
    }),
  };

  if (!email.valid || !hasPassword) {
    return { status: 'invalid', fieldErrors };
  }

  try {
    await signIn({
      email: email.value,
      password: input.password,
    });

    return { status: 'authenticated' };
  } catch (error) {
    return {
      status: 'error',
      category: normalizeAuthError(error).category,
    };
  }
}
