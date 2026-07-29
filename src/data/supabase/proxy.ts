import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { getSupabaseEnvironment } from '@/config/env';

type CookieUpdate = Readonly<{
  name: string;
  value: string;
  options: CookieOptions;
}>;

export async function updateSupabaseSession(
  request: NextRequest,
): Promise<NextResponse> {
  const environment = getSupabaseEnvironment();
  const cookieUpdates = new Map<string, CookieUpdate>();
  const responseHeaders = new Map<string, string>();
  let response = NextResponse.next({ request });

  const rebuildResponse = () => {
    response = NextResponse.next({ request });

    cookieUpdates.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });
    responseHeaders.forEach((value, name) => {
      response.headers.set(name, value);
    });
  };

  const supabase = createServerClient(
    environment.supabaseUrl,
    environment.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            cookieUpdates.set(name, { name, value, options });
          });
          Object.entries(headers).forEach(([name, value]) => {
            responseHeaders.set(name, value);
          });
          rebuildResponse();
        },
      },
    },
  );

  await supabase.auth.getClaims();

  return response;
}
