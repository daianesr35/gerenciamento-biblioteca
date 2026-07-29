import { describe, expect, it, vi } from 'vitest';

import { fetchGoogleBookByIsbn, GoogleBooksRequestError } from './google-books';

describe('adaptador da Google Books', () => {
  it('consulta o endpoint com ISBN, limite de um resultado e chave privada', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(async () => {
      return new Response(JSON.stringify({ totalItems: 0 }), { status: 200 });
    });

    await expect(
      fetchGoogleBookByIsbn(
        '9781234567890',
        'private-key',
        fetchImplementation,
      ),
    ).resolves.toEqual({ totalItems: 0 });

    const [requestUrl, options] = fetchImplementation.mock.calls[0]!;
    const url = new URL(
      requestUrl instanceof Request ? requestUrl.url : requestUrl,
    );
    expect(url.origin + url.pathname).toBe(
      'https://www.googleapis.com/books/v1/volumes',
    );
    expect(Object.fromEntries(url.searchParams)).toEqual({
      q: 'isbn:9781234567890',
      printType: 'books',
      projection: 'lite',
      maxResults: '1',
      key: 'private-key',
    });
    expect(options?.method).toBe('GET');
    expect(options?.signal).toBeInstanceOf(AbortSignal);
  });

  it('normaliza erro HTTP sem expor a resposta', async () => {
    const fetchImplementation = vi.fn<typeof fetch>(
      async () => new Response('detalhe interno', { status: 500 }),
    );

    await expect(
      fetchGoogleBookByIsbn('1234567890', 'key', fetchImplementation),
    ).rejects.toMatchObject({
      category: 'unavailable',
    } satisfies Partial<GoogleBooksRequestError>);
  });

  it.each([
    ['JSON inválido', new Response('{', { status: 200 })],
    [
      'estrutura inesperada',
      new Response(JSON.stringify({ items: [] }), { status: 200 }),
    ],
  ])('trata %s como indisponibilidade', async (_case, response) => {
    const fetchImplementation = vi.fn<typeof fetch>(async () => response);

    await expect(
      fetchGoogleBookByIsbn('1234567890', 'key', fetchImplementation),
    ).rejects.toMatchObject({
      category: 'unavailable',
    } satisfies Partial<GoogleBooksRequestError>);
  });

  it('distingue erro de rede de timeout', async () => {
    const networkFailure = vi.fn<typeof fetch>(async () => {
      throw new TypeError('network');
    });
    await expect(
      fetchGoogleBookByIsbn('1234567890', 'key', networkFailure),
    ).rejects.toMatchObject({
      category: 'unavailable',
    } satisfies Partial<GoogleBooksRequestError>);

    const pendingRequest = vi.fn<typeof fetch>(
      (_input, options) =>
        new Promise<Response>((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () => {
            reject(new DOMException('aborted', 'AbortError'));
          });
        }),
    );
    await expect(
      fetchGoogleBookByIsbn('1234567890', 'key', pendingRequest, 1),
    ).rejects.toMatchObject({
      category: 'timeout',
    } satisfies Partial<GoogleBooksRequestError>);
  });
});
