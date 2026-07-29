import { describe, expect, it, vi } from 'vitest';

import type { BookRow } from '@/data/supabase/books';

import { getOwnBookById, listOwnBooks, mapBookRow } from './books';

const BOOK_ID = '123e4567-e89b-42d3-a456-426614174000';
const ROW: BookRow = {
  id: BOOK_ID,
  isbn: '9780000000001',
  titulo: 'Livro de teste',
  autor: 'Autora',
  editora: 'Editora',
  imagem_capa: 'https://example.com/capa.jpg',
  situacao: 'disponivel',
};

describe('mapeamento de Livro', () => {
  it('mapeia as sete propriedades e a situação disponível', () => {
    expect(mapBookRow(ROW)).toEqual({
      id: BOOK_ID,
      isbn: '9780000000001',
      title: 'Livro de teste',
      author: 'Autora',
      publisher: 'Editora',
      coverImageUrl: 'https://example.com/capa.jpg',
      status: 'disponivel',
    });
  });

  it('preserva campos opcionais nulos e a situação emprestado', () => {
    expect(
      mapBookRow({
        ...ROW,
        isbn: null,
        editora: null,
        imagem_capa: null,
        situacao: 'emprestado',
      }),
    ).toMatchObject({
      isbn: null,
      publisher: null,
      coverImageUrl: null,
      status: 'emprestado',
    });
  });
});

describe('listagem de Livros próprios', () => {
  it('mapeia os Livros retornados', async () => {
    await expect(listOwnBooks(async () => [ROW])).resolves.toEqual({
      status: 'success',
      books: [mapBookRow(ROW)],
    });
  });

  it('aceita lista vazia', async () => {
    await expect(listOwnBooks(async () => [])).resolves.toEqual({
      status: 'success',
      books: [],
    });
  });

  it('normaliza falhas sem expor o erro original', async () => {
    await expect(
      listOwnBooks(async () => {
        throw new Error('detalhe interno');
      }),
    ).resolves.toEqual({ status: 'error', category: 'unavailable' });
  });
});

describe('consulta de Livro próprio', () => {
  it('retorna o Livro encontrado', async () => {
    await expect(getOwnBookById(BOOK_ID, async () => ROW)).resolves.toEqual({
      status: 'success',
      book: mapBookRow(ROW),
    });
  });

  it('unifica Livro inexistente ou inacessível como não encontrado', async () => {
    await expect(getOwnBookById(BOOK_ID, async () => null)).resolves.toEqual({
      status: 'not_found',
      book: null,
    });
  });

  it('rejeita identificador inválido antes da consulta', async () => {
    const getRow = vi.fn();
    await expect(getOwnBookById('id-invalido', getRow)).resolves.toEqual({
      status: 'invalid_id',
      book: null,
    });
    expect(getRow).not.toHaveBeenCalled();
  });

  it('aceita UUID válido sem restringir a versão', async () => {
    const uuidVersion7 = '01890f47-3a5b-7cc2-98c4-dc0c0c07398f';
    const getRow = vi.fn(async () => null);

    await expect(getOwnBookById(uuidVersion7, getRow)).resolves.toEqual({
      status: 'not_found',
      book: null,
    });
    expect(getRow).toHaveBeenCalledWith(uuidVersion7);
  });

  it('normaliza falha inesperada', async () => {
    await expect(
      getOwnBookById(BOOK_ID, async () => {
        throw new Error('detalhe interno');
      }),
    ).resolves.toEqual({ status: 'error', category: 'unavailable' });
  });
});
