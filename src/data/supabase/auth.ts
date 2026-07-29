import { createSupabaseServerClient } from '@/data/supabase/server';
import type { AuthIdentityResult, RegistrationInput } from '@/types/auth';

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

export async function signUpOwner(
  input: RegistrationInput,
): Promise<{ hasSession: boolean }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        nome: input.name,
      },
    },
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw { code: 'unexpected_failure' };
  }

  return {
    hasSession: data.session !== null,
  };
}
