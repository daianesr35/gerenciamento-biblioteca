'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { deleteOwnBook } from '@/services/books';
import type { DeleteBookActionState } from '@/types/books';

export async function deleteBookAction(
  bookId: string,
  _previousState: DeleteBookActionState,
): Promise<DeleteBookActionState> {
  void _previousState;
  const result = await deleteOwnBook(bookId);

  if (result.status === 'related_records') {
    return {
      status: 'error',
      message:
        'Este livro não pode ser excluído porque possui solicitações ou empréstimos relacionados.',
    };
  }
  if (result.status === 'invalid_id' || result.status === 'not_found') {
    return { status: 'error', message: 'Não foi possível excluir o livro.' };
  }
  if (result.status === 'error') {
    return {
      status: 'error',
      message: 'Não foi possível excluir o livro. Tente novamente.',
    };
  }

  revalidatePath('/biblioteca');
  revalidatePath(`/livros/${bookId}`);
  redirect('/biblioteca');
}
