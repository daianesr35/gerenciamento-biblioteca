import { describe, expect, it, vi } from 'vitest';

import { getPublicLibrary } from './public-library';

const IDENTIFIER = '123e4567-e89b-42d3-a456-426614174000';
const ROW = {
  id: 'livro-1',
  isbn: null,
  titulo: 'Livro real',
  autor: 'Autora real',
  editora: 'Editora real',
  imagem_capa: null,
  categoria: 'Ficção',
};

describe('service da Biblioteca pública', () => {
  it('rejeita UUID inválido sem consultar as RPCs', async () => {
    const locate = vi.fn();
    const list = vi.fn();

    await expect(getPublicLibrary('invalido', locate, list)).resolves.toEqual({
      status: 'invalid_id',
    });
    expect(locate).not.toHaveBeenCalled();
    expect(list).not.toHaveBeenCalled();
  });

  it('diferencia Biblioteca inexistente sem listar livros', async () => {
    const locate = vi.fn(async () => null);
    const list = vi.fn();

    await expect(getPublicLibrary(IDENTIFIER, locate, list)).resolves.toEqual({
      status: 'not_found',
    });
    expect(list).not.toHaveBeenCalled();
  });

  it('diferencia catálogo vazio', async () => {
    await expect(
      getPublicLibrary(
        IDENTIFIER,
        vi.fn(async () => 'Maria'),
        vi.fn(async () => []),
      ),
    ).resolves.toEqual({ status: 'empty', ownerName: 'Maria' });
  });

  it('mapeia o catálogo de uma Biblioteca existente', async () => {
    await expect(
      getPublicLibrary(
        IDENTIFIER,
        vi.fn(async () => 'Maria'),
        vi.fn(async () => [ROW]),
      ),
    ).resolves.toEqual({
      status: 'success',
      ownerName: 'Maria',
      books: [
        {
          id: 'livro-1',
          isbn: null,
          title: 'Livro real',
          author: 'Autora real',
          publisher: 'Editora real',
          coverImageUrl: null,
          category: 'Ficção',
        },
      ],
    });
  });

  it('converte falhas simples em indisponibilidade temporária', async () => {
    await expect(
      getPublicLibrary(
        IDENTIFIER,
        vi.fn(async () => {
          throw new Error('interno');
        }),
        vi.fn(),
      ),
    ).resolves.toEqual({ status: 'error', category: 'unavailable' });
  });
});
