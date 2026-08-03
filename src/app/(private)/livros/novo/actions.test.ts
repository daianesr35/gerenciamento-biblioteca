import { beforeEach, describe, expect, it, vi } from 'vitest';

const createOwnBook = vi.hoisted(() => vi.fn());
const lookupGoogleBookByIsbn = vi.hoisted(() => vi.fn());
const revalidatePath = vi.hoisted(() => vi.fn());
const redirect = vi.hoisted(() => vi.fn());

vi.mock('@/services/books', () => ({ createOwnBook }));
vi.mock('@/services/google-books', () => ({ lookupGoogleBookByIsbn }));
vi.mock('next/cache', () => ({ revalidatePath }));
vi.mock('next/navigation', () => ({ redirect }));

import { createBookAction, lookupGoogleBookAction } from './actions';

beforeEach(() => {
  createOwnBook.mockReset();
  lookupGoogleBookByIsbn.mockReset();
  revalidatePath.mockReset();
  redirect.mockReset();
});

describe('Server Action de consulta por ISBN', () => {
  it('delega exclusivamente ao service e retorna o resultado', async () => {
    const success = {
      status: 'success',
      book: {
        title: 'Livro',
        author: 'Autora',
        isbn: '9781234567890',
        publisher: 'Editora',
        coverImageUrl: '',
        category: 'Ficção científica',
      },
    };
    lookupGoogleBookByIsbn.mockResolvedValue(success);

    await expect(lookupGoogleBookAction('978-1234567890')).resolves.toEqual(
      success,
    );
    expect(lookupGoogleBookByIsbn).toHaveBeenCalledWith('978-1234567890');
    expect(createOwnBook).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('preserva o erro padronizado sem efeitos colaterais', async () => {
    const error = {
      status: 'error',
      category: 'timeout',
      message: 'A consulta demorou mais que o esperado. Tente novamente.',
    };
    lookupGoogleBookByIsbn.mockResolvedValue(error);

    await expect(lookupGoogleBookAction('1234567890')).resolves.toEqual(error);
    expect(createOwnBook).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
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
    formData.set('category', 'Ficção científica');
    formData.set('biblioteca_id', 'não permitido');
    formData.set('situacao', 'emprestado');

    await createBookAction({ status: 'idle' }, formData);

    expect(createOwnBook).toHaveBeenCalledWith({
      title: 'Livro',
      author: 'Autora',
      isbn: '123',
      publisher: 'Editora',
      coverImageUrl: 'https://example.com/capa.jpg',
      category: 'Ficção científica',
    });
    expect(revalidatePath).toHaveBeenCalledWith('/biblioteca');
    expect(redirect).toHaveBeenCalledWith('/biblioteca');
  });

  it('encaminha categoria vazia para normalização pelo serviço', async () => {
    createOwnBook.mockResolvedValue({ status: 'success' });

    await createBookAction({ status: 'idle' }, new FormData());

    expect(createOwnBook).toHaveBeenCalledWith(
      expect.objectContaining({ category: '' }),
    );
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
