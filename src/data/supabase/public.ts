import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseEnvironment } from '@/config/env';

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
