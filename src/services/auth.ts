import type {
  AuthErrorCategory,
  AuthValidationResult,
  NormalizedAuthError,
} from '@/types/auth';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AUTH_ERROR_CODE_MAP: Readonly<Record<string, AuthErrorCategory>> = {
  invalid_credentials: 'invalid_credentials',
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
