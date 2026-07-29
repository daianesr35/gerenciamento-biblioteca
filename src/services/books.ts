import {
  getAuthenticatedBookRow,
  listAuthenticatedBookRows,
  type BookRow,
} from '@/data/supabase/books';
import type { Book, BookDetailResult, BookListResult } from '@/types/books';

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
