import { createSupabaseServerClient } from '@/data/supabase/server';
import type { AuthIdentityResult } from '@/types/auth';

export async function getServerAuthIdentity(): Promise<AuthIdentityResult> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  const subject = data?.claims.sub;

  if (error || !data || typeof subject !== 'string' || subject.length === 0) {
    return {
      status: 'anonymous',
      identity: null,
    };
  }

  return {
    status: 'authenticated',
    identity: {
      userId: subject,
      email: typeof data.claims.email === 'string' ? data.claims.email : null,
    },
  };
}
