import {
  fetchGoogleBookByIsbn,
  GoogleBooksRequestError,
} from '@/data/google-books';
import { getGoogleBooksEnvironment } from '@/config/env';
import type {
  GoogleBooksLookupResult,
  GoogleBooksVolumeResponse,
} from '@/types/google-books';

type LookupVolume = (isbn: string) => Promise<GoogleBooksVolumeResponse>;

function defaultLookup(isbn: string): Promise<GoogleBooksVolumeResponse> {
  const { apiKey } = getGoogleBooksEnvironment();
  return fetchGoogleBookByIsbn(isbn, apiKey);
}

export function normalizeIsbn(isbn: string): string {
  return isbn.replace(/[\s-]/g, '');
}

function optionalString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function mapCoverUrl(value: unknown): string {
  const candidate = optionalString(value);
  if (!candidate) {
    return '';
  }

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return '';
    }
    if (url.protocol === 'http:') {
      url.protocol = 'https:';
    }
    return url.toString();
  } catch {
    return '';
  }
}

export async function lookupGoogleBookByIsbn(
  input: string,
  lookupVolume: LookupVolume = defaultLookup,
): Promise<GoogleBooksLookupResult> {
  const isbn = normalizeIsbn(input);
  if (isbn.length !== 10 && isbn.length !== 13) {
    return {
      status: 'invalid',
      message: 'Informe um ISBN com 10 ou 13 caracteres.',
    };
  }

  try {
    const response = await lookupVolume(isbn);
    const firstItem = response.items?.[0];
    if (response.totalItems === 0 || !firstItem) {
      return {
        status: 'not_found',
        message: 'Livro não encontrado para o ISBN informado.',
      };
    }

    const volumeInfo = firstItem.volumeInfo;
    const authors = Array.isArray(volumeInfo?.authors)
      ? volumeInfo.authors.map(optionalString).filter(Boolean).join(', ')
      : '';
    const category = Array.isArray(volumeInfo?.categories)
      ? (volumeInfo.categories.map(optionalString).find(Boolean) ?? '')
      : '';

    return {
      status: 'success',
      book: {
        title: optionalString(volumeInfo?.title),
        author: authors,
        isbn,
        publisher: optionalString(volumeInfo?.publisher),
        coverImageUrl: mapCoverUrl(volumeInfo?.imageLinks?.thumbnail),
        category,
      },
    };
  } catch (error) {
    const category =
      error instanceof GoogleBooksRequestError
        ? error.category
        : ('unavailable' as const);
    return {
      status: 'error',
      category,
      message:
        category === 'timeout'
          ? 'A consulta demorou mais que o esperado. Tente novamente.'
          : 'Não foi possível consultar o livro. Tente novamente.',
    };
  }
}
