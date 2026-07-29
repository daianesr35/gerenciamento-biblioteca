'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createOwnBook } from '@/services/books';
import { lookupGoogleBookByIsbn } from '@/services/google-books';
import type { CreateBookActionState } from '@/types/books';
import type { GoogleBooksLookupResult } from '@/types/google-books';

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

export async function lookupGoogleBookAction(
  isbn: string,
): Promise<GoogleBooksLookupResult> {
  return lookupGoogleBookByIsbn(isbn);
}
