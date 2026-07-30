import {
  listPublicBookRows,
  locatePublicLibrary,
  type PublicBookRow,
} from '@/data/supabase/public';
import type { PublicBook, PublicLibraryResult } from '@/types/public-library';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function mapPublicBookRow(row: PublicBookRow): PublicBook {
  return {
    id: row.id,
    isbn: row.isbn,
    title: row.titulo,
    author: row.autor,
    publisher: row.editora,
    coverImageUrl: row.imagem_capa,
  };
}

type LocateLibrary = (identifier: string) => Promise<boolean>;
type ListBooks = (identifier: string) => Promise<readonly PublicBookRow[]>;

export async function getPublicLibrary(
  identifier: string,
  locateLibrary: LocateLibrary = locatePublicLibrary,
  listBooks: ListBooks = listPublicBookRows,
): Promise<PublicLibraryResult> {
  if (!UUID_PATTERN.test(identifier)) {
    return { status: 'invalid_id' };
  }

  try {
    if (!(await locateLibrary(identifier))) {
      return { status: 'not_found' };
    }

    const books = (await listBooks(identifier)).map(mapPublicBookRow);
    return books.length === 0
      ? { status: 'empty' }
      : { status: 'success', books };
  } catch {
    return { status: 'error', category: 'unavailable' };
  }
}
