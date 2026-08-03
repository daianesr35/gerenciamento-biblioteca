import { describe, expect, it, vi } from 'vitest';

import type { BookRow } from '@/data/supabase/books';

import {
  createOwnBook,
  getOwnBookById,
  listOwnBooks,
  mapBookRow,
  updateOwnBook,
} from './books';

const BOOK_ID = '123e4567-e89b-42d3-a456-426614174000';
const ROW: BookRow = {
  id: BOOK_ID,
  isbn: '9780000000001',
  titulo: 'Livro de teste',
  autor: 'Autora',
  editora: 'Editora',
  imagem_capa: 'https://example.com/capa.jpg',
  categoria: 'Ficção',
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
      category: 'Ficção',
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
        categoria: null,
        situacao: 'emprestado',
      }),
    ).toMatchObject({
      isbn: null,
      publisher: null,
      coverImageUrl: null,
      category: null,
      status: 'emprestado',
    });
  });
});

describe('edição de Livro próprio', () => {
  it('rejeita UUID inválido antes de chamar o adaptador', async () => {
    const updateBook = vi.fn();
    await expect(
      updateOwnBook(
        'inválido',
        {
          title: 'Livro',
          author: 'Autora',
          isbn: null,
          publisher: null,
          coverImageUrl: null,
        },
        updateBook,
      ),
    ).resolves.toEqual({ status: 'invalid_id' });
    expect(updateBook).not.toHaveBeenCalled();
  });

  it('normaliza os campos e opcionais antes de atualizar', async () => {
    const updateBook = vi.fn(async () => true);
    await expect(
      updateOwnBook(
        BOOK_ID,
        {
          title: '  Livro editado ',
          author: ' Autora ',
          isbn: ' ',
          publisher: ' Editora ',
          coverImageUrl: '',
          category: '   ',
        },
        updateBook,
      ),
    ).resolves.toEqual({ status: 'success' });
    expect(updateBook).toHaveBeenCalledWith(BOOK_ID, {
      title: 'Livro editado',
      author: 'Autora',
      isbn: null,
      publisher: 'Editora',
      coverImageUrl: null,
      category: null,
    });
  });

  it('rejeita campos obrigatórios e URL inválida sem atualizar', async () => {
    const updateBook = vi.fn();
    await expect(
      updateOwnBook(
        BOOK_ID,
        {
          title: '',
          author: ' ',
          isbn: null,
          publisher: null,
          coverImageUrl: 'arquivo-local',
        },
        updateBook,
      ),
    ).resolves.toEqual({
      status: 'invalid',
      fieldErrors: {
        title: 'Informe o título.',
        author: 'Informe o autor.',
        coverImageUrl: 'Informe uma URL de capa válida.',
      },
    });
    expect(updateBook).not.toHaveBeenCalled();
  });

  it('distingue sucesso, ausência segura e falha técnica', async () => {
    await expect(
      updateOwnBook(
        BOOK_ID,
        {
          title: 'Livro',
          author: 'Autora',
          isbn: null,
          publisher: null,
          coverImageUrl: null,
        },
        async () => false,
      ),
    ).resolves.toEqual({ status: 'not_found' });

    await expect(
      updateOwnBook(
        BOOK_ID,
        {
          title: 'Livro',
          author: 'Autora',
          isbn: null,
          publisher: null,
          coverImageUrl: null,
        },
        async () => {
          throw new Error('interno');
        },
      ),
    ).resolves.toEqual({ status: 'error', category: 'unavailable' });
  });
});

describe('cadastro de Livro próprio', () => {
  it('normaliza espaços e campos opcionais vazios antes de inserir', async () => {
    const insertBook = vi.fn(async () => undefined);
    await expect(
      createOwnBook(
        {
          title: '  Livro novo  ',
          author: '  Autora  ',
          isbn: '  9780000000001  ',
          publisher: '   ',
          coverImageUrl: '',
          category: ' Ficção ',
        },
        insertBook,
      ),
    ).resolves.toEqual({ status: 'success' });
    expect(insertBook).toHaveBeenCalledWith({
      title: 'Livro novo',
      author: 'Autora',
      isbn: '9780000000001',
      publisher: null,
      coverImageUrl: null,
      category: 'Ficção',
    });
  });

  it('rejeita título e autor vazios sem chamar o adaptador', async () => {
    const insertBook = vi.fn();
    await expect(
      createOwnBook(
        {
          title: ' ',
          author: '',
          isbn: null,
          publisher: null,
          coverImageUrl: null,
        },
        insertBook,
      ),
    ).resolves.toEqual({
      status: 'invalid',
      fieldErrors: {
        title: 'Informe o título.',
        author: 'Informe o autor.',
      },
    });
    expect(insertBook).not.toHaveBeenCalled();
  });

  it('rejeita URL de capa inválida', async () => {
    const insertBook = vi.fn();
    await expect(
      createOwnBook(
        {
          title: 'Livro',
          author: 'Autora',
          isbn: null,
          publisher: null,
          coverImageUrl: 'arquivo-local',
        },
        insertBook,
      ),
    ).resolves.toMatchObject({
      status: 'invalid',
      fieldErrors: { coverImageUrl: 'Informe uma URL de capa válida.' },
    });
    expect(insertBook).not.toHaveBeenCalled();
  });

  it('converte falha técnica em resultado seguro', async () => {
    await expect(
      createOwnBook(
        {
          title: 'Livro',
          author: 'Autora',
          isbn: null,
          publisher: null,
          coverImageUrl: null,
        },
        async () => {
          throw new Error('detalhe interno');
        },
      ),
    ).resolves.toEqual({ status: 'error', category: 'unavailable' });
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
