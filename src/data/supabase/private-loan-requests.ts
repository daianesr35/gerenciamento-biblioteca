import { createSupabaseServerClient } from '@/data/supabase/server';
import type { LoanRequestStatus } from '@/types/loan-requests';

export const PRIVATE_LOAN_REQUEST_COLUMNS =
  'id,nome_solicitante,telefone_solicitante,data_solicitacao,status,livros!inner(titulo,imagem_capa)';

export type PrivateLoanRequestRow = Readonly<{
  id: string;
  nome_solicitante: string;
  telefone_solicitante: string;
  data_solicitacao: string;
  status: LoanRequestStatus;
  livros:
    | { titulo: string; imagem_capa: string | null }
    | readonly { titulo: string; imagem_capa: string | null }[];
}>;

export async function listAuthenticatedLoanRequestRows(): Promise<
  readonly PrivateLoanRequestRow[]
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('solicitacoes')
    .select(PRIVATE_LOAN_REQUEST_COLUMNS)
    .order('data_solicitacao', { ascending: false })
    .order('id', { ascending: true });

  if (error) {
    throw { code: 'request_list_unavailable' };
  }

  return (data ?? []) as unknown as PrivateLoanRequestRow[];
}

export async function confirmAuthenticatedLoanRequest(
  requestId: string,
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('confirmar_solicitacao_privada', {
    p_solicitacao_id: requestId,
  });

  if (error) {
    throw {
      code:
        error.message === 'book_unavailable'
          ? 'book_unavailable'
          : error.message === 'invalid_request'
            ? 'invalid_request'
            : error.code,
    };
  }
}

export async function refuseAuthenticatedLoanRequest(
  requestId: string,
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('recusar_solicitacao_privada', {
    p_solicitacao_id: requestId,
  });

  if (error) {
    throw {
      code:
        error.message === 'invalid_request' ? 'invalid_request' : error.code,
    };
  }
}
