import { createSupabaseServerClient } from '@/data/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { BookStatus } from '@/types/books';
import type { CreateBookInput, UpdateBookInput } from '@/types/books';

export const BOOK_COLUMNS = 'id,isbn,titulo,autor,editora,imagem_capa,situacao';

export type BookRow = Readonly<{
  id: string;
  isbn: string | null;
  titulo: string;
  autor: string;
  editora: string | null;
  imagem_capa: string | null;
  situacao: BookStatus;
}>;

export type CreateBookRowInput = CreateBookInput;

export type DeleteBookRowResult = 'deleted' | 'not_found' | 'related_records';

async function getAuthenticatedLibraryId(
  supabase: SupabaseClient,
): Promise<string> {
  const { data, error } = await supabase
    .from('bibliotecas')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    throw { code: 'library_unavailable' };
  }

  return data.id;
}

export async function listAuthenticatedBookRows(): Promise<readonly BookRow[]> {
  const supabase = await createSupabaseServerClient();
  const libraryId = await getAuthenticatedLibraryId(supabase);
  const { data, error } = await supabase
    .from('livros')
    .select(BOOK_COLUMNS)
    .eq('biblioteca_id', libraryId)
    .order('titulo', { ascending: true })
    .order('id', { ascending: true });

  if (error) {
    throw { code: 'book_list_unavailable' };
  }

  return (data ?? []) as BookRow[];
}

export async function getAuthenticatedBookRow(
  bookId: string,
): Promise<BookRow | null> {
  const supabase = await createSupabaseServerClient();
  const libraryId = await getAuthenticatedLibraryId(supabase);
  const { data, error } = await supabase
    .from('livros')
    .select(BOOK_COLUMNS)
    .eq('biblioteca_id', libraryId)
    .eq('id', bookId)
    .maybeSingle();

  if (error) {
    throw { code: 'book_query_unavailable' };
  }

  return data as BookRow | null;
}

export async function insertAuthenticatedBookRow(
  input: CreateBookRowInput,
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const libraryId = await getAuthenticatedLibraryId(supabase);
  const { error } = await supabase.from('livros').insert({
    biblioteca_id: libraryId,
    isbn: input.isbn,
    titulo: input.title,
    autor: input.author,
    editora: input.publisher,
    imagem_capa: input.coverImageUrl,
  });

  if (error) {
    throw { code: 'book_insert_unavailable' };
  }
}

export async function updateAuthenticatedBookRow(
  bookId: string,
  input: UpdateBookInput,
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const libraryId = await getAuthenticatedLibraryId(supabase);
  const { data, error } = await supabase
    .from('livros')
    .update({
      isbn: input.isbn,
      titulo: input.title,
      autor: input.author,
      editora: input.publisher,
      imagem_capa: input.coverImageUrl,
    })
    .eq('biblioteca_id', libraryId)
    .eq('id', bookId)
    .select('id')
    .maybeSingle();

  if (error) {
    throw { code: 'book_update_unavailable' };
  }

  return data !== null;
}

export async function deleteAuthenticatedBookRow(
  bookId: string,
): Promise<DeleteBookRowResult> {
  const supabase = await createSupabaseServerClient();
  const libraryId = await getAuthenticatedLibraryId(supabase);
  const { data, error } = await supabase
    .from('livros')
    .delete()
    .eq('biblioteca_id', libraryId)
    .eq('id', bookId)
    .select('id')
    .maybeSingle();

  if (error?.code === '23503') {
    return 'related_records';
  }
  if (error) {
    throw { code: 'book_delete_unavailable' };
  }

  return data === null ? 'not_found' : 'deleted';
}
