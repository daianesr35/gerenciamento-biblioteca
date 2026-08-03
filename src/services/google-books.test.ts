import { describe, expect, it, vi } from 'vitest';

import { GoogleBooksRequestError } from '@/data/google-books';

import { lookupGoogleBookByIsbn, normalizeIsbn } from './google-books';

describe('consulta de livro por ISBN', () => {
  it('remove espaços e hífens do ISBN', () => {
    expect(normalizeIsbn(' 978-1 234-56789-0 ')).toBe('9781234567890');
  });

  it.each(['', '123456789', '12345678901', '123456789012'])(
    'rejeita comprimento inválido sem consultar a API: %j',
    async (isbn) => {
      const lookupVolume = vi.fn();

      await expect(lookupGoogleBookByIsbn(isbn, lookupVolume)).resolves.toEqual(
        {
          status: 'invalid',
          message: 'Informe um ISBN com 10 ou 13 caracteres.',
        },
      );
      expect(lookupVolume).not.toHaveBeenCalled();
    },
  );

  it('aceita 10 caracteres sem validar checksum e mapeia o primeiro resultado', async () => {
    const lookupVolume = vi.fn(async () => ({
      totalItems: 2,
      items: [
        {
          volumeInfo: {
            title: '  Livro encontrado ',
            authors: [' Autora Um ', '', 'Autor Dois'],
            publisher: ' Editora ',
            categories: [null, '  ', ' Ficção científica ', 'Aventura'],
            imageLinks: { thumbnail: 'http://example.com/capa.jpg' },
          },
        },
        { volumeInfo: { title: 'Segundo resultado ignorado' } },
      ],
    }));

    await expect(
      lookupGoogleBookByIsbn('12-3456-789X', lookupVolume),
    ).resolves.toEqual({
      status: 'success',
      book: {
        title: 'Livro encontrado',
        author: 'Autora Um, Autor Dois',
        isbn: '123456789X',
        publisher: 'Editora',
        coverImageUrl: 'https://example.com/capa.jpg',
        category: 'Ficção científica',
      },
    });
    expect(lookupVolume).toHaveBeenCalledOnce();
    expect(lookupVolume).toHaveBeenCalledWith('123456789X');
  });

  it('aceita 13 caracteres e mantém vazios os dados ausentes ou inválidos', async () => {
    await expect(
      lookupGoogleBookByIsbn('ABCDEFGHIJKLM', async () => ({
        totalItems: 1,
        items: [
          {
            volumeInfo: {
              authors: 'formato inesperado',
              imageLinks: { thumbnail: 'file:///capa.jpg' },
            },
          },
        ],
      })),
    ).resolves.toEqual({
      status: 'success',
      book: {
        title: '',
        author: '',
        isbn: 'ABCDEFGHIJKLM',
        publisher: '',
        coverImageUrl: '',
        category: '',
      },
    });
  });

  it('mantém categoria vazia quando a API não retorna uma lista válida', async () => {
    await expect(
      lookupGoogleBookByIsbn('9781234567890', async () => ({
        totalItems: 1,
        items: [{ volumeInfo: { categories: 'Ficção' } }],
      })),
    ).resolves.toMatchObject({
      status: 'success',
      book: { category: '' },
    });
  });

  it.each([{ totalItems: 0 }, { totalItems: 1, items: [] }])(
    'retorna ausência quando não há primeiro item',
    async (response) => {
      await expect(
        lookupGoogleBookByIsbn('9781234567890', async () => response),
      ).resolves.toEqual({
        status: 'not_found',
        message: 'Livro não encontrado para o ISBN informado.',
      });
    },
  );

  it.each([
    ['timeout', new GoogleBooksRequestError('timeout')],
    ['unavailable', new GoogleBooksRequestError('unavailable')],
    ['unavailable', new Error('falha inesperada')],
  ] as const)('padroniza falha como %s', async (category, failure) => {
    const result = await lookupGoogleBookByIsbn('9781234567890', async () => {
      throw failure;
    });

    expect(result).toMatchObject({ status: 'error', category });
    expect(result).not.toHaveProperty('error');
  });
});
