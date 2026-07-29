import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { getSupabaseEnvironment } from '@/config/env';

type CookieUpdate = Readonly<{
  name: string;
  value: string;
  options: CookieOptions;
}>;

const VISITOR_ROUTES = new Set(['/login', '/cadastro']);
const PRIVATE_ROUTES = new Set([
  '/dashboard',
  '/biblioteca',
  '/solicitacoes',
  '/emprestimos',
  '/pagina-publica',
  '/configuracoes',
  '/perfil',
]);

function isPrivateRoute(pathname: string): boolean {
  return PRIVATE_ROUTES.has(pathname) || pathname.startsWith('/livros/');
}

export async function updateSupabaseSession(
  request: NextRequest,
): Promise<NextResponse> {
  const environment = getSupabaseEnvironment();
  const cookieUpdates = new Map<string, CookieUpdate>();
  const responseHeaders = new Map<string, string>();
  let response = NextResponse.next({ request });

  const rebuildResponse = (destination?: string) => {
    response = destination
      ? NextResponse.redirect(new URL(destination, request.url))
      : NextResponse.next({ request });

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

  const { data, error } = await supabase.auth.getClaims();
  const subject = data?.claims.sub;
  const isAuthenticated =
    !error && typeof subject === 'string' && subject.length > 0;
  const pathname = request.nextUrl.pathname;

  if (isPrivateRoute(pathname) && !isAuthenticated) {
    rebuildResponse('/login');
  } else if (VISITOR_ROUTES.has(pathname) && isAuthenticated) {
    rebuildResponse('/dashboard');
  } else if (pathname === '/') {
    rebuildResponse(isAuthenticated ? '/dashboard' : '/login');
  }

  return response;
}
