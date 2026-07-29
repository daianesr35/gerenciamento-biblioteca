import { beforeEach, describe, expect, it, vi } from 'vitest';

const createSupabaseServerClient = vi.hoisted(() => vi.fn());

vi.mock('@/data/supabase/server', () => ({ createSupabaseServerClient }));

import { deleteAuthenticatedBookRow } from './books';

const LIBRARY_ID = '123e4567-e89b-42d3-a456-426614174001';
const BOOK_ID = '123e4567-e89b-42d3-a456-426614174000';

function createDeleteClient(
  result: Readonly<{ data: unknown; error: unknown }>,
) {
  const maybeSingle = vi.fn(async () => result);
  const select = vi.fn(() => ({ maybeSingle }));
  const byBook = vi.fn(() => ({ select }));
  const byLibrary = vi.fn(() => ({ eq: byBook }));
  const deleteRow = vi.fn(() => ({ eq: byLibrary }));
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
      : { delete: deleteRow },
  );

  return { client: { from }, from, deleteRow, byLibrary, byBook, select };
}

beforeEach(() => createSupabaseServerClient.mockReset());

describe('exclusão no adaptador Supabase de Livros', () => {
  it('usa SSR, resolve a Biblioteca e filtra o DELETE por Biblioteca e UUID', async () => {
    const query = createDeleteClient({ data: { id: BOOK_ID }, error: null });
    createSupabaseServerClient.mockResolvedValue(query.client);

    await expect(deleteAuthenticatedBookRow(BOOK_ID)).resolves.toBe('deleted');
    expect(createSupabaseServerClient).toHaveBeenCalledOnce();
    expect(query.from.mock.calls).toEqual([['bibliotecas'], ['livros']]);
    expect(query.deleteRow).toHaveBeenCalledOnce();
    expect(query.byLibrary).toHaveBeenCalledWith('biblioteca_id', LIBRARY_ID);
    expect(query.byBook).toHaveBeenCalledWith('id', BOOK_ID);
    expect(query.select).toHaveBeenCalledWith('id');
  });

  it('trata zero linhas como ausência', async () => {
    const query = createDeleteClient({ data: null, error: null });
    createSupabaseServerClient.mockResolvedValue(query.client);

    await expect(deleteAuthenticatedBookRow(BOOK_ID)).resolves.toBe(
      'not_found',
    );
  });

  it('identifica foreign key pelo código estável sem expor o erro', async () => {
    const query = createDeleteClient({
      data: null,
      error: { code: '23503', message: 'detalhe interno' },
    });
    createSupabaseServerClient.mockResolvedValue(query.client);

    await expect(deleteAuthenticatedBookRow(BOOK_ID)).resolves.toBe(
      'related_records',
    );
  });

  it('normaliza qualquer outra falha técnica', async () => {
    const query = createDeleteClient({
      data: null,
      error: { code: 'XX000', message: 'detalhe interno' },
    });
    createSupabaseServerClient.mockResolvedValue(query.client);

    await expect(deleteAuthenticatedBookRow(BOOK_ID)).rejects.toEqual({
      code: 'book_delete_unavailable',
    });
  });
});
