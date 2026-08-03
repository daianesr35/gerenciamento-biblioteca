import { beforeEach, describe, expect, it, vi } from 'vitest';

const createSupabaseServerClient = vi.hoisted(() => vi.fn());

vi.mock('@/data/supabase/server', () => ({ createSupabaseServerClient }));

import { deleteAuthenticatedBookRow } from './books';

const BOOK_ID = '123e4567-e89b-42d3-a456-426614174000';

function createDeleteClient(
  result: Readonly<{ data: unknown; error: unknown }>,
) {
  const rpc = vi.fn(async () => result);
  return { client: { rpc }, rpc };
}

beforeEach(() => createSupabaseServerClient.mockReset());

describe('exclusão no adaptador Supabase de Livros', () => {
  it('usa a RPC autenticada e envia somente o UUID do Livro', async () => {
    const query = createDeleteClient({ data: 'deleted', error: null });
    createSupabaseServerClient.mockResolvedValue(query.client);

    await expect(deleteAuthenticatedBookRow(BOOK_ID)).resolves.toBe('deleted');
    expect(createSupabaseServerClient).toHaveBeenCalledOnce();
    expect(query.rpc).toHaveBeenCalledWith('excluir_livro_privado', {
      p_livro_id: BOOK_ID,
    });
  });

  it('trata zero linhas como ausência', async () => {
    const query = createDeleteClient({ data: 'not_found', error: null });
    createSupabaseServerClient.mockResolvedValue(query.client);

    await expect(deleteAuthenticatedBookRow(BOOK_ID)).resolves.toBe(
      'not_found',
    );
  });

  it('preserva o bloqueio quando existe empréstimo ativo', async () => {
    const query = createDeleteClient({
      data: 'active_loan',
      error: null,
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

  it('rejeita resposta inesperada da RPC', async () => {
    const query = createDeleteClient({ data: 'inesperado', error: null });
    createSupabaseServerClient.mockResolvedValue(query.client);

    await expect(deleteAuthenticatedBookRow(BOOK_ID)).rejects.toEqual({
      code: 'book_delete_unavailable',
    });
  });
});
