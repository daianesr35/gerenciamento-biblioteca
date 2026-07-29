'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { updateOwnBook } from '@/services/books';
import type { UpdateBookActionState } from '@/types/books';

function readFormValue(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === 'string' ? value : '';
}

export async function updateBookAction(
  bookId: string,
  _previousState: UpdateBookActionState,
  formData: FormData,
): Promise<UpdateBookActionState> {
  const result = await updateOwnBook(bookId, {
    title: readFormValue(formData, 'title'),
    author: readFormValue(formData, 'author'),
    isbn: readFormValue(formData, 'isbn'),
    publisher: readFormValue(formData, 'publisher'),
    coverImageUrl: readFormValue(formData, 'coverImageUrl'),
  });

  if (result.status !== 'success') {
    return result;
  }

  revalidatePath('/biblioteca');
  revalidatePath(`/livros/${bookId}`);
  revalidatePath(`/livros/${bookId}/editar`);
  redirect(`/livros/${bookId}`);
}
