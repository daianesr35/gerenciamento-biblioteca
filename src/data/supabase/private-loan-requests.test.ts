import { beforeEach, describe, expect, it, vi } from 'vitest';

const createSupabaseServerClient = vi.hoisted(() => vi.fn());
vi.mock('@/data/supabase/server', () => ({ createSupabaseServerClient }));

import {
  PRIVATE_LOAN_REQUEST_COLUMNS,
  confirmAuthenticatedLoanRequest,
  listAuthenticatedLoanRequestRows,
  refuseAuthenticatedLoanRequest,
} from './private-loan-requests';

const REQUEST_ID = '123e4567-e89b-42d3-a456-426614174000';

beforeEach(() => createSupabaseServerClient.mockReset());

describe('adaptador privado de solicitações', () => {
  it('lista pela RLS com colunas mínimas e ordenação estável', async () => {
    const finalOrder = vi.fn().mockResolvedValue({ data: [], error: null });
    const firstOrder = vi.fn(() => ({ order: finalOrder }));
    const select = vi.fn(() => ({ order: firstOrder }));
    const from = vi.fn(() => ({ select }));
    createSupabaseServerClient.mockResolvedValue({ from });
    await expect(listAuthenticatedLoanRequestRows()).resolves.toEqual([]);
    expect(from).toHaveBeenCalledWith('solicitacoes');
    expect(select).toHaveBeenCalledWith(PRIVATE_LOAN_REQUEST_COLUMNS);
    expect(firstOrder).toHaveBeenCalledWith('data_solicitacao', {
      ascending: false,
    });
    expect(finalOrder).toHaveBeenCalledWith('id', { ascending: true });
  });

  it('normaliza falha da listagem', async () => {
    const order = vi.fn().mockResolvedValue({ data: null, error: {} });
    createSupabaseServerClient.mockResolvedValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({ order: vi.fn(() => ({ order })) })),
      })),
    });
    await expect(listAuthenticatedLoanRequestRows()).rejects.toEqual({
      code: 'request_list_unavailable',
    });
  });

  it('usa somente RPCs privadas e o identificador da solicitação', async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    createSupabaseServerClient.mockResolvedValue({ rpc });
    await confirmAuthenticatedLoanRequest(REQUEST_ID);
    await refuseAuthenticatedLoanRequest(REQUEST_ID);
    expect(rpc).toHaveBeenNthCalledWith(1, 'confirmar_solicitacao_privada', {
      p_solicitacao_id: REQUEST_ID,
    });
    expect(rpc).toHaveBeenNthCalledWith(2, 'recusar_solicitacao_privada', {
      p_solicitacao_id: REQUEST_ID,
    });
  });
});
