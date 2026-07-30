import {
  getPublicOwnerName,
  listPublicBookRows,
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

type GetOwnerName = (identifier: string) => Promise<string | null>;
type ListBooks = (identifier: string) => Promise<readonly PublicBookRow[]>;

export async function getPublicLibrary(
  identifier: string,
  getOwnerName: GetOwnerName = getPublicOwnerName,
  listBooks: ListBooks = listPublicBookRows,
): Promise<PublicLibraryResult> {
  if (!UUID_PATTERN.test(identifier)) {
    return { status: 'invalid_id' };
  }

  try {
    const ownerName = await getOwnerName(identifier);

    if (!ownerName) {
      return { status: 'not_found' };
    }

    const books = (await listBooks(identifier)).map(mapPublicBookRow);
    return books.length === 0
      ? { status: 'empty', ownerName }
      : { status: 'success', ownerName, books };
  } catch {
    return { status: 'error', category: 'unavailable' };
  }
}
