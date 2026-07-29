import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const createBrowserClient = vi.hoisted(() => vi.fn());

vi.mock('@supabase/ssr', () => ({
  createBrowserClient,
}));

const originalEnvironment = process.env;

beforeEach(() => {
  vi.resetModules();
  createBrowserClient.mockReset();
  createBrowserClient.mockReturnValue({ client: 'browser' });
  process.env = {
    ...originalEnvironment,
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
  };
});

afterEach(() => {
  process.env = originalEnvironment;
});

describe('cliente Supabase de navegador', () => {
  it('usa somente URL e chave publicável e reutiliza a instância', async () => {
    const { getSupabaseBrowserClient } = await import('./browser');

    const first = getSupabaseBrowserClient();
    const second = getSupabaseBrowserClient();

    expect(first).toBe(second);
    expect(createBrowserClient).toHaveBeenCalledOnce();
    expect(createBrowserClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'sb_publishable_example',
    );
  });

  it('falha claramente quando falta configuração obrigatória', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const { getSupabaseBrowserClient } = await import('./browser');

    expect(() => getSupabaseBrowserClient()).toThrow(
      'Variável de ambiente obrigatória ausente: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    );
    expect(createBrowserClient).not.toHaveBeenCalled();
  });
});
