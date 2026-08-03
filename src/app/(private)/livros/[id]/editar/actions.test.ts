import { beforeEach, describe, expect, it, vi } from 'vitest';

const updateOwnBook = vi.hoisted(() => vi.fn());
const revalidatePath = vi.hoisted(() => vi.fn());
const redirect = vi.hoisted(() => vi.fn());

vi.mock('@/services/books', () => ({ updateOwnBook }));
vi.mock('next/cache', () => ({ revalidatePath }));
vi.mock('next/navigation', () => ({ redirect }));

import { updateBookAction } from './actions';

const BOOK_ID = '123e4567-e89b-42d3-a456-426614174000';

beforeEach(() => {
  updateOwnBook.mockReset();
  revalidatePath.mockReset();
  redirect.mockReset();
});

describe('Server Action de edição de Livro', () => {
  it('envia somente UUID e campos permitidos e conclui o fluxo', async () => {
    updateOwnBook.mockResolvedValue({ status: 'success' });
    const formData = new FormData();
    formData.set('title', 'Livro');
    formData.set('author', 'Autora');
    formData.set('isbn', '');
    formData.set('publisher', '');
    formData.set('coverImageUrl', '');
    formData.set('category', 'Ficção científica');
    formData.set('biblioteca_id', 'proibido');
    formData.set('situacao', 'emprestado');

    await updateBookAction(BOOK_ID, { status: 'idle' }, formData);

    expect(updateOwnBook).toHaveBeenCalledWith(BOOK_ID, {
      title: 'Livro',
      author: 'Autora',
      isbn: '',
      publisher: '',
      coverImageUrl: '',
      category: 'Ficção científica',
    });
    expect(revalidatePath.mock.calls).toEqual([
      ['/biblioteca'],
      [`/livros/${BOOK_ID}`],
      [`/livros/${BOOK_ID}/editar`],
    ]);
    expect(redirect).toHaveBeenCalledWith(`/livros/${BOOK_ID}`);
  });

  it('encaminha categoria vazia para permitir sua remoção', async () => {
    updateOwnBook.mockResolvedValue({ status: 'success' });

    await updateBookAction(BOOK_ID, { status: 'idle' }, new FormData());

    expect(updateOwnBook).toHaveBeenCalledWith(
      BOOK_ID,
      expect.objectContaining({ category: '' }),
    );
  });

  it.each([
    {
      status: 'invalid',
      fieldErrors: { title: 'Informe o título.' },
    },
    {
      status: 'invalid',
      fieldErrors: { author: 'Informe o autor.' },
    },
    {
      status: 'invalid',
      fieldErrors: { coverImageUrl: 'Informe uma URL de capa válida.' },
    },
    { status: 'not_found' },
    { status: 'error', category: 'unavailable' },
  ])('devolve $status com segurança sem concluir o fluxo', async (result) => {
    updateOwnBook.mockResolvedValue(result);

    await expect(
      updateBookAction(BOOK_ID, { status: 'idle' }, new FormData()),
    ).resolves.toEqual(result);
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});
