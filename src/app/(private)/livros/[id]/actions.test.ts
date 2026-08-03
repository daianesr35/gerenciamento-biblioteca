import { beforeEach, describe, expect, it, vi } from 'vitest';

const deleteOwnBook = vi.hoisted(() => vi.fn());
const revalidatePath = vi.hoisted(() => vi.fn());
const redirect = vi.hoisted(() => vi.fn());

vi.mock('@/services/books', () => ({ deleteOwnBook }));
vi.mock('next/cache', () => ({ revalidatePath }));
vi.mock('next/navigation', () => ({ redirect }));

import { deleteBookAction } from './actions';

const BOOK_ID = '123e4567-e89b-42d3-a456-426614174000';

beforeEach(() => {
  deleteOwnBook.mockReset();
  revalidatePath.mockReset();
  redirect.mockReset();
});

describe('Server Action de exclusão de Livro', () => {
  it('revalida somente as rotas afetadas e redireciona após sucesso', async () => {
    deleteOwnBook.mockResolvedValue({ status: 'success' });

    await deleteBookAction(BOOK_ID, { status: 'idle' });

    expect(deleteOwnBook).toHaveBeenCalledWith(BOOK_ID);
    expect(revalidatePath.mock.calls).toEqual([
      ['/biblioteca'],
      [`/livros/${BOOK_ID}`],
    ]);
    expect(redirect).toHaveBeenCalledWith('/biblioteca');
  });

  it.each([
    [{ status: 'invalid_id' }, 'Não foi possível excluir o livro.'],
    [{ status: 'not_found' }, 'Não foi possível excluir o livro.'],
    [
      { status: 'related_records' },
      'Este livro não pode ser excluído enquanto estiver emprestado.',
    ],
    [
      { status: 'error', category: 'unavailable' },
      'Não foi possível excluir o livro. Tente novamente.',
    ],
  ])(
    'retorna mensagem segura sem concluir o fluxo',
    async (result, message) => {
      deleteOwnBook.mockResolvedValue(result);

      await expect(
        deleteBookAction(BOOK_ID, { status: 'idle' }),
      ).resolves.toEqual({ status: 'error', message });
      expect(revalidatePath).not.toHaveBeenCalled();
      expect(redirect).not.toHaveBeenCalled();
    },
  );
});
