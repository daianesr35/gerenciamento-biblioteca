import type { GoogleBooksVolumeResponse } from '@/types/google-books';

const GOOGLE_BOOKS_URL = 'https://www.googleapis.com/books/v1/volumes';
const DEFAULT_TIMEOUT_MS = 5_000;

export class GoogleBooksRequestError extends Error {
  constructor(
    readonly category: 'timeout' | 'unavailable',
    options?: ErrorOptions,
  ) {
    super('Falha ao consultar a Google Books API.', options);
  }
}

function isVolumeResponse(value: unknown): value is GoogleBooksVolumeResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const response = value as Record<string, unknown>;
  if (
    typeof response.totalItems !== 'number' ||
    !Number.isFinite(response.totalItems) ||
    response.totalItems < 0
  ) {
    return false;
  }

  return (
    response.items === undefined ||
    (Array.isArray(response.items) &&
      response.items.every((item) => item !== null && typeof item === 'object'))
  );
}

export async function fetchGoogleBookByIsbn(
  isbn: string,
  apiKey: string,
  fetchImplementation: typeof fetch = fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<GoogleBooksVolumeResponse> {
  const url = new URL(GOOGLE_BOOKS_URL);
  url.searchParams.set('q', `isbn:${isbn}`);
  url.searchParams.set('printType', 'books');
  url.searchParams.set('projection', 'full');
  url.searchParams.set('maxResults', '1');
  url.searchParams.set('key', apiKey);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImplementation(url, {
      method: 'GET',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new GoogleBooksRequestError('unavailable');
    }

    const body: unknown = await response.json();
    if (!isVolumeResponse(body)) {
      throw new GoogleBooksRequestError('unavailable');
    }

    return body;
  } catch (error) {
    if (error instanceof GoogleBooksRequestError) {
      throw error;
    }
    if (controller.signal.aborted) {
      throw new GoogleBooksRequestError('timeout', { cause: error });
    }
    throw new GoogleBooksRequestError('unavailable', { cause: error });
  } finally {
    clearTimeout(timeout);
  }
}
