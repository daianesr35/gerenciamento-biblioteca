import { beforeEach, describe, expect, it, vi } from 'vitest';

const createOwnBook = vi.hoisted(() => vi.fn());
const revalidatePath = vi.hoisted(() => vi.fn());
const redirect = vi.hoisted(() => vi.fn());

vi.mock('@/services/books', () => ({ createOwnBook }));
vi.mock('next/cache', () => ({ revalidatePath }));
vi.mock('next/navigation', () => ({ redirect }));

import { createBookAction } from './actions';

beforeEach(() => {
  createOwnBook.mockReset();
  revalidatePath.mockReset();
  redirect.mockReset();
});

describe('Server Action de cadastro de Livro', () => {
  it('extrai somente os campos permitidos e redireciona no sucesso', async () => {
    createOwnBook.mockResolvedValue({ status: 'success' });
    const formData = new FormData();
    formData.set('title', 'Livro');
    formData.set('author', 'Autora');
    formData.set('isbn', '123');
    formData.set('publisher', 'Editora');
    formData.set('coverImageUrl', 'https://example.com/capa.jpg');
    formData.set('biblioteca_id', 'não permitido');
    formData.set('situacao', 'emprestado');

    await createBookAction({ status: 'idle' }, formData);

    expect(createOwnBook).toHaveBeenCalledWith({
      title: 'Livro',
      author: 'Autora',
      isbn: '123',
      publisher: 'Editora',
      coverImageUrl: 'https://example.com/capa.jpg',
    });
    expect(revalidatePath).toHaveBeenCalledWith('/biblioteca');
    expect(redirect).toHaveBeenCalledWith('/biblioteca');
  });

  it('devolve validação sem revalidar ou redirecionar', async () => {
    const invalid = {
      status: 'invalid',
      fieldErrors: { title: 'Informe o título.' },
    };
    createOwnBook.mockResolvedValue(invalid);

    await expect(
      createBookAction({ status: 'idle' }, new FormData()),
    ).resolves.toEqual(invalid);
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('devolve falha técnica segura', async () => {
    const error = { status: 'error', category: 'unavailable' };
    createOwnBook.mockResolvedValue(error);

    await expect(
      createBookAction({ status: 'idle' }, new FormData()),
    ).resolves.toEqual(error);
    expect(redirect).not.toHaveBeenCalled();
  });
});
