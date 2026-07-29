import {
  deleteAuthenticatedBookRow,
  getAuthenticatedBookRow,
  insertAuthenticatedBookRow,
  listAuthenticatedBookRows,
  updateAuthenticatedBookRow,
  type BookRow,
} from '@/data/supabase/books';
import type {
  Book,
  BookDetailResult,
  BookListResult,
  CreateBookInput,
  CreateBookResult,
  DeleteBookResult,
  UpdateBookInput,
  UpdateBookResult,
} from '@/types/books';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function mapBookRow(row: BookRow): Book {
  return {
    id: row.id,
    isbn: row.isbn,
    title: row.titulo,
    author: row.autor,
    publisher: row.editora,
    coverImageUrl: row.imagem_capa,
    status: row.situacao,
  };
}

type ListRows = () => Promise<readonly BookRow[]>;

export async function listOwnBooks(
  listRows: ListRows = listAuthenticatedBookRows,
): Promise<BookListResult> {
  try {
    const rows = await listRows();
    return { status: 'success', books: rows.map(mapBookRow) };
  } catch {
    return { status: 'error', category: 'unavailable' };
  }
}

type GetRow = (bookId: string) => Promise<BookRow | null>;

export async function getOwnBookById(
  bookId: string,
  getRow: GetRow = getAuthenticatedBookRow,
): Promise<BookDetailResult> {
  if (!UUID_PATTERN.test(bookId)) {
    return { status: 'invalid_id', book: null };
  }

  try {
    const row = await getRow(bookId);
    if (!row) {
      return { status: 'not_found', book: null };
    }

    return { status: 'success', book: mapBookRow(row) };
  } catch {
    return { status: 'error', category: 'unavailable' };
  }
}

type InsertBook = (input: CreateBookInput) => Promise<void>;

function normalizeOptional(value: string | null): string | null {
  const normalized = value?.trim() ?? '';
  return normalized || null;
}

export async function createOwnBook(
  input: CreateBookInput,
  insertBook: InsertBook = insertAuthenticatedBookRow,
): Promise<CreateBookResult> {
  const normalized: CreateBookInput = {
    isbn: normalizeOptional(input.isbn),
    title: input.title.trim(),
    author: input.author.trim(),
    publisher: normalizeOptional(input.publisher),
    coverImageUrl: normalizeOptional(input.coverImageUrl),
  };
  const fieldErrors: Record<string, string> = {};

  if (!normalized.title) {
    fieldErrors.title = 'Informe o título.';
  }
  if (!normalized.author) {
    fieldErrors.author = 'Informe o autor.';
  }
  if (normalized.coverImageUrl) {
    try {
      const url = new URL(normalized.coverImageUrl);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        fieldErrors.coverImageUrl = 'Informe uma URL de capa válida.';
      }
    } catch {
      fieldErrors.coverImageUrl = 'Informe uma URL de capa válida.';
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'invalid', fieldErrors };
  }

  try {
    await insertBook(normalized);
    return { status: 'success' };
  } catch {
    return { status: 'error', category: 'unavailable' };
  }
}

type UpdateBook = (bookId: string, input: UpdateBookInput) => Promise<boolean>;

export async function updateOwnBook(
  bookId: string,
  input: UpdateBookInput,
  updateBook: UpdateBook = updateAuthenticatedBookRow,
): Promise<UpdateBookResult> {
  if (!UUID_PATTERN.test(bookId)) {
    return { status: 'invalid_id' };
  }

  const normalized: UpdateBookInput = {
    isbn: normalizeOptional(input.isbn),
    title: input.title.trim(),
    author: input.author.trim(),
    publisher: normalizeOptional(input.publisher),
    coverImageUrl: normalizeOptional(input.coverImageUrl),
  };
  const fieldErrors: Record<string, string> = {};

  if (!normalized.title) {
    fieldErrors.title = 'Informe o título.';
  }
  if (!normalized.author) {
    fieldErrors.author = 'Informe o autor.';
  }
  if (normalized.coverImageUrl) {
    try {
      const url = new URL(normalized.coverImageUrl);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        fieldErrors.coverImageUrl = 'Informe uma URL de capa válida.';
      }
    } catch {
      fieldErrors.coverImageUrl = 'Informe uma URL de capa válida.';
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'invalid', fieldErrors };
  }

  try {
    const updated = await updateBook(bookId, normalized);
    return updated ? { status: 'success' } : { status: 'not_found' };
  } catch {
    return { status: 'error', category: 'unavailable' };
  }
}

type DeleteBook = (
  bookId: string,
) => Promise<'deleted' | 'not_found' | 'related_records'>;

export async function deleteOwnBook(
  bookId: string,
  deleteBook: DeleteBook = deleteAuthenticatedBookRow,
): Promise<DeleteBookResult> {
  if (!UUID_PATTERN.test(bookId)) {
    return { status: 'invalid_id' };
  }

  try {
    const result = await deleteBook(bookId);
    if (result === 'deleted') {
      return { status: 'success' };
    }
    return { status: result };
  } catch {
    return { status: 'error', category: 'unavailable' };
  }
}
