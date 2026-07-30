import { createSupabaseServerClient } from '@/data/supabase/server';

export const LOAN_COLUMNS =
  'id,livro_id,nome_solicitante,telefone_solicitante,data_emprestimo,data_devolucao,livros!inner(titulo,imagem_capa)';

export type LoanRow = Readonly<{
  id: string;
  livro_id: string;
  nome_solicitante: string;
  telefone_solicitante: string;
  data_emprestimo: string;
  data_devolucao: string | null;
  livros:
    | { titulo: string; imagem_capa: string | null }
    | readonly { titulo: string; imagem_capa: string | null }[];
}>;

export type AvailableBookRow = Readonly<{ id: string; titulo: string }>;

export async function listAuthenticatedLoanRows(): Promise<readonly LoanRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('emprestimos')
    .select(LOAN_COLUMNS)
    .order('data_emprestimo', { ascending: false })
    .order('id', { ascending: true });
  if (error) throw { code: 'loan_list_unavailable' };
  return (data ?? []) as unknown as LoanRow[];
}

export async function listAuthenticatedAvailableBookRows(): Promise<
  readonly AvailableBookRow[]
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('livros')
    .select('id,titulo')
    .eq('situacao', 'disponivel')
    .order('titulo', { ascending: true })
    .order('id', { ascending: true });
  if (error) throw { code: 'book_list_unavailable' };
  return (data ?? []) as AvailableBookRow[];
}

function rpcError(error: { code?: string; message?: string }): never {
  throw {
    code:
      error.message === 'book_unavailable' || error.message === 'invalid_loan'
        ? error.message
        : error.code,
  };
}

export async function createAuthenticatedDirectLoan(
  bookId: string,
  requesterName: string,
  requesterPhone: string,
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('criar_emprestimo_direto_privado', {
    p_livro_id: bookId,
    p_nome_solicitante: requesterName,
    p_telefone_solicitante: requesterPhone,
  });
  if (error) rpcError(error);
}

export async function returnAuthenticatedLoan(loanId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('registrar_devolucao_privada', {
    p_emprestimo_id: loanId,
  });
  if (error) rpcError(error);
}
