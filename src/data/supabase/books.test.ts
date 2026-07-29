import { beforeEach, describe, expect, it, vi } from 'vitest';

const createSupabaseServerClient = vi.hoisted(() => vi.fn());

vi.mock('@/data/supabase/server', () => ({ createSupabaseServerClient }));

import {
  BOOK_COLUMNS,
  getAuthenticatedBookRow,
  insertAuthenticatedBookRow,
  listAuthenticatedBookRows,
} from './books';

const LIBRARY_ID = '123e4567-e89b-42d3-a456-426614174001';
const BOOK_ID = '123e4567-e89b-42d3-a456-426614174000';
const ROW = {
  id: BOOK_ID,
  isbn: null,
  titulo: 'Livro',
  autor: 'Autora',
  editora: null,
  imagem_capa: null,
  situacao: 'disponivel',
};

type QueryResult = Readonly<{ data: unknown; error: unknown }>;

function createClient(bookQuery: unknown, libraryResult?: QueryResult) {
  const libraryMaybeSingle = vi.fn(async () => ({
    data: { id: LIBRARY_ID },
    error: null,
    ...libraryResult,
  }));
  const librarySelect = vi.fn(() => ({
    limit: vi.fn(() => ({ maybeSingle: libraryMaybeSingle })),
  }));
  const bookSelect = vi.fn(() => bookQuery);
  const from = vi.fn((table: string) =>
    table === 'bibliotecas'
      ? { select: librarySelect }
      : { select: bookSelect },
  );

  return { client: { from }, from, librarySelect, bookSelect };
}

beforeEach(() => createSupabaseServerClient.mockReset());

describe('adaptador Supabase de Livros', () => {
  it('lista colunas mínimas, filtra a Biblioteca e ordena por título e id', async () => {
    const finalOrder = vi.fn(async () => ({ data: [ROW], error: null }));
    const firstOrder = vi.fn(() => ({ order: finalOrder }));
    const byLibrary = vi.fn(() => ({ order: firstOrder }));
    const query = { eq: byLibrary };
    const { client, from, librarySelect, bookSelect } = createClient(query);
    createSupabaseServerClient.mockResolvedValue(client);

    await expect(listAuthenticatedBookRows()).resolves.toEqual([ROW]);
    expect(createSupabaseServerClient).toHaveBeenCalledOnce();
    expect(from).toHaveBeenNthCalledWith(1, 'bibliotecas');
    expect(from).toHaveBeenNthCalledWith(2, 'livros');
    expect(librarySelect).toHaveBeenCalledWith('id');
    expect(bookSelect).toHaveBeenCalledWith(BOOK_COLUMNS);
    expect(byLibrary).toHaveBeenCalledWith('biblioteca_id', LIBRARY_ID);
    expect(firstOrder).toHaveBeenCalledWith('titulo', { ascending: true });
    expect(finalOrder).toHaveBeenCalledWith('id', { ascending: true });
  });

  it('aceita lista vazia e normaliza falha', async () => {
    const finalOrder = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: null, error: new Error('interno') });
    const query = {
      eq: vi.fn(() => ({
        order: vi.fn(() => ({ order: finalOrder })),
      })),
    };
    const { client } = createClient(query);
    createSupabaseServerClient.mockResolvedValue(client);

    await expect(listAuthenticatedBookRows()).resolves.toEqual([]);
    await expect(listAuthenticatedBookRows()).rejects.toEqual({
      code: 'book_list_unavailable',
    });
  });

  it('consulta por Biblioteca e identificador e aceita ausência', async () => {
    const maybeSingle = vi
      .fn()
      .mockResolvedValueOnce({ data: ROW, error: null })
      .mockResolvedValueOnce({ data: null, error: null });
    const byId = vi.fn(() => ({ maybeSingle }));
    const byLibrary = vi.fn(() => ({ eq: byId }));
    const { client, bookSelect } = createClient({ eq: byLibrary });
    createSupabaseServerClient.mockResolvedValue(client);

    await expect(getAuthenticatedBookRow(BOOK_ID)).resolves.toEqual(ROW);
    expect(bookSelect).toHaveBeenCalledWith(BOOK_COLUMNS);
    expect(byLibrary).toHaveBeenCalledWith('biblioteca_id', LIBRARY_ID);
    expect(byId).toHaveBeenCalledWith('id', BOOK_ID);
    await expect(getAuthenticatedBookRow(BOOK_ID)).resolves.toBeNull();
  });

  it('normaliza falha da Biblioteca e falha inesperada do detalhe', async () => {
    const failedLibrary = createClient(
      {},
      { data: null, error: new Error('interno') },
    );
    createSupabaseServerClient.mockResolvedValueOnce(failedLibrary.client);
    await expect(listAuthenticatedBookRows()).rejects.toEqual({
      code: 'library_unavailable',
    });

    const failedDetail = createClient({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(async () => ({
            data: null,
            error: new Error('interno'),
          })),
        })),
      })),
    });
    createSupabaseServerClient.mockResolvedValueOnce(failedDetail.client);
    await expect(getAuthenticatedBookRow(BOOK_ID)).rejects.toEqual({
      code: 'book_query_unavailable',
    });
  });
});

describe('inserção de Livro', () => {
  function createInsertClient(insert: ReturnType<typeof vi.fn>) {
    const from = vi.fn((table: string) =>
      table === 'bibliotecas'
        ? {
            select: vi.fn(() => ({
              limit: vi.fn(() => ({
                maybeSingle: vi.fn(async () => ({
                  data: { id: LIBRARY_ID },
                  error: null,
                })),
              })),
            })),
          }
        : { insert },
    );
    return { from };
  }

  it('insere somente campos permitidos na Biblioteca resolvida', async () => {
    const insert = vi.fn(async () => ({ error: null }));
    createSupabaseServerClient.mockResolvedValue(createInsertClient(insert));

    await expect(
      insertAuthenticatedBookRow({
        title: 'Livro',
        author: 'Autora',
        isbn: null,
        publisher: 'Editora',
        coverImageUrl: null,
      }),
    ).resolves.toBeUndefined();

    expect(createSupabaseServerClient).toHaveBeenCalledOnce();
    expect(insert).toHaveBeenCalledWith({
      biblioteca_id: LIBRARY_ID,
      titulo: 'Livro',
      autor: 'Autora',
      isbn: null,
      editora: 'Editora',
      imagem_capa: null,
    });
  });

  it('normaliza falha de inserção', async () => {
    const insert = vi.fn(async () => ({
      error: new Error('detalhe interno'),
    }));
    createSupabaseServerClient.mockResolvedValue(createInsertClient(insert));

    await expect(
      insertAuthenticatedBookRow({
        title: 'Livro',
        author: 'Autora',
        isbn: null,
        publisher: null,
        coverImageUrl: null,
      }),
    ).rejects.toEqual({ code: 'book_insert_unavailable' });
  });

  it('interrompe a inserção quando a Biblioteca não pode ser resolvida', async () => {
    const insert = vi.fn();
    createSupabaseServerClient.mockResolvedValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          limit: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({
              data: null,
              error: new Error('detalhe interno'),
            })),
          })),
        })),
        insert,
      })),
    });

    await expect(
      insertAuthenticatedBookRow({
        title: 'Livro',
        author: 'Autora',
        isbn: null,
        publisher: null,
        coverImageUrl: null,
      }),
    ).rejects.toEqual({ code: 'library_unavailable' });
    expect(insert).not.toHaveBeenCalled();
  });
});
