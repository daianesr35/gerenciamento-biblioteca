import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';

import { getAuthenticatedPublicIdentifier } from './public-page';

function createClientResult(
  result: Readonly<{ data: unknown; error: unknown }>,
) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const limit = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ limit }));
  const from = vi.fn(() => ({ select }));
  const client = { from } as unknown as SupabaseClient;

  return { client, from, select, limit, maybeSingle };
}

describe('consulta do identificador público autenticado', () => {
  it('consulta somente o identificador da Biblioteca visível à sessão', async () => {
    const query = createClientResult({
      data: { identificador_publico: 'biblioteca-123' },
      error: null,
    });

    await expect(
      getAuthenticatedPublicIdentifier(async () => query.client),
    ).resolves.toBe('biblioteca-123');
    expect(query.from).toHaveBeenCalledWith('bibliotecas');
    expect(query.select).toHaveBeenCalledWith('identificador_publico');
    expect(query.limit).toHaveBeenCalledWith(1);
    expect(query.maybeSingle).toHaveBeenCalledOnce();
  });

  it('não expõe detalhes quando a consulta falha ou não retorna Biblioteca', async () => {
    const query = createClientResult({ data: null, error: null });

    await expect(
      getAuthenticatedPublicIdentifier(async () => query.client),
    ).rejects.toEqual({ code: 'public_identifier_unavailable' });
  });
});
