import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseEnvironment } from '@/config/env';
import type { PublicLoanRequestInput } from '@/types/loan-requests';

export type PublicBookRow = Readonly<{
  id: string;
  isbn: string | null;
  titulo: string;
  autor: string;
  editora: string | null;
  imagem_capa: string | null;
}>;

export function createPublicSupabaseClient(): SupabaseClient {
  const environment = getSupabaseEnvironment();

  return createClient(
    environment.supabaseUrl,
    environment.supabasePublishableKey,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );
}

export async function locatePublicLibrary(
  identifier: string,
): Promise<boolean> {
  const { data, error } = await createPublicSupabaseClient().rpc(
    'localizar_biblioteca_publica',
    { p_identificador_publico: identifier },
  );

  if (error) {
    throw { code: 'public_library_unavailable' };
  }

  return data === true;
}

export async function getPublicOwnerName(
  identifier: string,
): Promise<string | null> {
  const { data, error } = await createPublicSupabaseClient().rpc(
    'obter_nome_proprietario_publico',
    { p_identificador_publico: identifier },
  );

  if (error) {
    throw { code: 'public_owner_unavailable' };
  }

  return typeof data === 'string' ? data : null;
}

export async function listPublicBookRows(
  identifier: string,
): Promise<readonly PublicBookRow[]> {
  const { data, error } = await createPublicSupabaseClient().rpc(
    'listar_livros_publicos',
    { p_identificador_publico: identifier },
  );

  if (error) {
    throw { code: 'public_books_unavailable' };
  }

  return (data ?? []) as PublicBookRow[];
}

export async function createPublicLoanRequest(
  input: PublicLoanRequestInput,
): Promise<Readonly<{ requestId: string }>> {
  const { data, error } = await createPublicSupabaseClient().rpc(
    'criar_solicitacao_publica',
    {
      p_identificador_publico: input.publicIdentifier,
      p_livro_id: input.bookId,
      p_nome_solicitante: input.requesterName,
      p_telefone_solicitante: input.requesterPhone,
    },
  );

  if (error) {
    throw {
      code: error.code === 'P0001' ? 'book_unavailable' : 'request_unavailable',
    };
  }

  if (typeof data !== 'string') {
    throw { code: 'request_unavailable' };
  }

  return { requestId: data };
}
