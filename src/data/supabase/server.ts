import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

import { getSupabaseEnvironment } from '@/config/env';

const SERVER_COMPONENT_COOKIE_ERROR =
  'Cookies can only be modified in a Server Action or Route Handler';

function isServerComponentCookieWriteError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes(SERVER_COMPONENT_COOKIE_ERROR)
  );
}

export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  const environment = getSupabaseEnvironment();

  return createServerClient(
    environment.supabaseUrl,
    environment.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            if (!isServerComponentCookieWriteError(error)) {
              throw error;
            }

            // O Proxy persiste renovações quando a renderização de um
            // Server Component não pode escrever cabeçalhos Set-Cookie.
          }
        },
      },
    },
  );
}
