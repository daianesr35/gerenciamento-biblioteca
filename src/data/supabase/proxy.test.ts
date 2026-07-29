import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const createServerClient = vi.hoisted(() => vi.fn());

vi.mock('@supabase/ssr', () => ({
  createServerClient,
}));

import { updateSupabaseSession } from './proxy';

const originalEnvironment = process.env;

beforeEach(() => {
  createServerClient.mockReset();
  process.env = {
    ...originalEnvironment,
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
  };
});

afterEach(() => {
  process.env = originalEnvironment;
});

describe('renovação de sessão no Proxy', () => {
  it('propaga cookies para a requisição e a resposta e preserva os existentes', async () => {
    const getClaims = vi.fn(async () => {
      const options = createServerClient.mock.calls[0][2];
      options.cookies.setAll(
        [
          {
            name: 'supabase-session',
            value: 'updated',
            options: { httpOnly: true, path: '/' },
          },
        ],
        { 'Cache-Control': 'private, no-store', Expires: '0' },
      );
      return { data: { claims: { sub: 'user-id' } }, error: null };
    });
    createServerClient.mockReturnValue({ auth: { getClaims } });
    const request = new NextRequest('http://localhost:3000/dashboard', {
      headers: { cookie: 'existing=kept; supabase-session=old' },
    });

    const response = await updateSupabaseSession(request);

    expect(request.cookies.get('existing')?.value).toBe('kept');
    expect(request.cookies.get('supabase-session')?.value).toBe('updated');
    expect(response.cookies.get('supabase-session')?.value).toBe('updated');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('expires')).toBe('0');
    expect(response.headers.get('location')).toBeNull();
  });

  it('preserva atualizações quando setAll é chamado mais de uma vez', async () => {
    const getClaims = vi.fn(async () => {
      const options = createServerClient.mock.calls[0][2];
      options.cookies.setAll(
        [{ name: 'first', value: '1', options: { path: '/' } }],
        { 'Cache-Control': 'private, no-store' },
      );
      options.cookies.setAll(
        [{ name: 'second', value: '2', options: { path: '/' } }],
        { Pragma: 'no-cache' },
      );
      return { data: { claims: { sub: 'user-id' } }, error: null };
    });
    createServerClient.mockReturnValue({ auth: { getClaims } });

    const response = await updateSupabaseSession(
      new NextRequest('http://localhost:3000/dashboard'),
    );

    expect(response.cookies.get('first')?.value).toBe('1');
    expect(response.cookies.get('second')?.value).toBe('2');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('pragma')).toBe('no-cache');
  });

  it('permite que usuário autenticado acesse rota privada', async () => {
    const getClaims = vi.fn(async () => ({
      data: { claims: { sub: 'user-id' } },
      error: null,
    }));
    createServerClient.mockReturnValue({ auth: { getClaims } });

    const response = await updateSupabaseSession(
      new NextRequest('http://localhost:3000/dashboard'),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it('redireciona usuário não autenticado de rota privada para Login', async () => {
    const getClaims = vi.fn(async () => ({
      data: null,
      error: new Error('Auth session missing'),
    }));
    createServerClient.mockReturnValue({ auth: { getClaims } });

    const response = await updateSupabaseSession(
      new NextRequest('http://localhost:3000/dashboard'),
    );

    expect(getClaims).toHaveBeenCalledOnce();
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/login',
    );
    expect(response.cookies.getAll()).toEqual([]);
  });

  it('redireciona usuário autenticado do Login para o Dashboard', async () => {
    createServerClient.mockReturnValue({
      auth: {
        getClaims: vi.fn(async () => ({
          data: { claims: { sub: 'user-id' } },
          error: null,
        })),
      },
    });

    const response = await updateSupabaseSession(
      new NextRequest('http://localhost:3000/login'),
    );

    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/dashboard',
    );
  });

  it('redireciona usuário autenticado do Cadastro para o Dashboard', async () => {
    createServerClient.mockReturnValue({
      auth: {
        getClaims: vi.fn(async () => ({
          data: { claims: { sub: 'user-id' } },
          error: null,
        })),
      },
    });

    const response = await updateSupabaseSession(
      new NextRequest('http://localhost:3000/cadastro'),
    );

    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/dashboard',
    );
  });
});
