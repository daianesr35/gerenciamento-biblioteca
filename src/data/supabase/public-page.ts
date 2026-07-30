import type { SupabaseClient } from '@supabase/supabase-js';

import { createSupabaseServerClient } from '@/data/supabase/server';

type CreateClient = () => Promise<SupabaseClient>;

export async function getAuthenticatedPublicIdentifier(
  createClient: CreateClient = createSupabaseServerClient,
): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bibliotecas')
    .select('identificador_publico')
    .limit(1)
    .maybeSingle();

  if (error || !data?.identificador_publico) {
    throw { code: 'public_identifier_unavailable' };
  }

  return data.identificador_publico as string;
}
