import { describe, expect, it, vi } from 'vitest';

import { deleteOwnBook } from './books';

const BOOK_ID = '123e4567-e89b-42d3-a456-426614174000';

describe('exclusão de Livro próprio', () => {
  it('rejeita UUID inválido antes de chamar o adaptador', async () => {
    const deleteBook = vi.fn();
    await expect(deleteOwnBook('inválido', deleteBook)).resolves.toEqual({
      status: 'invalid_id',
    });
    expect(deleteBook).not.toHaveBeenCalled();
  });

  it.each([
    ['deleted', { status: 'success' }],
    ['not_found', { status: 'not_found' }],
    ['related_records', { status: 'related_records' }],
  ] as const)(
    'transforma %s no resultado seguro correspondente',
    async (row, expected) => {
      const deleteBook = vi.fn(async () => row);
      await expect(deleteOwnBook(BOOK_ID, deleteBook)).resolves.toEqual(
        expected,
      );
      expect(deleteBook).toHaveBeenCalledWith(BOOK_ID);
    },
  );

  it('converte falha técnica em resultado genérico', async () => {
    await expect(
      deleteOwnBook(BOOK_ID, async () => {
        throw new Error('detalhe interno');
      }),
    ).resolves.toEqual({ status: 'error', category: 'unavailable' });
  });
});
