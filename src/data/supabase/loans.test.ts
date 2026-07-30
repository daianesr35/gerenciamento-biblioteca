import { beforeEach, describe, expect, it, vi } from 'vitest';

const createSupabaseServerClient = vi.hoisted(() => vi.fn());
vi.mock('@/data/supabase/server', () => ({ createSupabaseServerClient }));

import {
  createAuthenticatedDirectLoan,
  listAuthenticatedLoanRows,
  returnAuthenticatedLoan,
} from './loans';

const ID = '123e4567-e89b-42d3-a456-426614174000';

beforeEach(() => createSupabaseServerClient.mockReset());

describe('adaptador Supabase de empréstimos', () => {
  it('consulta empréstimos pela RLS e ordena os dados', async () => {
    const finalOrder = vi.fn().mockResolvedValue({ data: [], error: null });
    const firstOrder = vi.fn(() => ({ order: finalOrder }));
    const select = vi.fn(() => ({ order: firstOrder }));
    const from = vi.fn(() => ({ select }));
    createSupabaseServerClient.mockResolvedValue({ from });
    await expect(listAuthenticatedLoanRows()).resolves.toEqual([]);
    expect(from).toHaveBeenCalledWith('emprestimos');
    expect(firstOrder).toHaveBeenCalledWith('data_emprestimo', {
      ascending: false,
    });
  });

  it('chama somente as RPCs da Etapa 11.2', async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    createSupabaseServerClient.mockResolvedValue({ rpc });
    await createAuthenticatedDirectLoan(ID, 'Ana', '1199');
    await returnAuthenticatedLoan(ID);
    expect(rpc).toHaveBeenNthCalledWith(1, 'criar_emprestimo_direto_privado', {
      p_livro_id: ID,
      p_nome_solicitante: 'Ana',
      p_telefone_solicitante: '1199',
    });
    expect(rpc).toHaveBeenNthCalledWith(2, 'registrar_devolucao_privada', {
      p_emprestimo_id: ID,
    });
  });
});
