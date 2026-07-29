'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createOwnBook } from '@/services/books';
import type { CreateBookActionState } from '@/types/books';

function readFormValue(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === 'string' ? value : '';
}

export async function createBookAction(
  _previousState: CreateBookActionState,
  formData: FormData,
): Promise<CreateBookActionState> {
  const result = await createOwnBook({
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
  redirect('/biblioteca');
}
