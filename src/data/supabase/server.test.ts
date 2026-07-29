import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  cookies: vi.fn(),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: mocks.createServerClient,
}));

vi.mock('next/headers', () => ({
  cookies: mocks.cookies,
}));

import { createSupabaseServerClient } from './server';

const originalEnvironment = process.env;

beforeEach(() => {
  mocks.createServerClient.mockReset();
  mocks.cookies.mockReset();
  process.env = {
    ...originalEnvironment,
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
  };
});

afterEach(() => {
  process.env = originalEnvironment;
});

describe('cliente Supabase de servidor', () => {
  it('cria uma instância por chamada e lê os cookies da requisição', async () => {
    const stores = [
      { getAll: vi.fn(() => [{ name: 'first', value: '1' }]), set: vi.fn() },
      { getAll: vi.fn(() => [{ name: 'second', value: '2' }]), set: vi.fn() },
    ];
    mocks.cookies
      .mockResolvedValueOnce(stores[0])
      .mockResolvedValueOnce(stores[1]);
    mocks.createServerClient
      .mockReturnValueOnce({ client: 1 })
      .mockReturnValueOnce({ client: 2 });

    const first = await createSupabaseServerClient();
    const firstOptions = mocks.createServerClient.mock.calls[0][2];
    const second = await createSupabaseServerClient();
    const secondOptions = mocks.createServerClient.mock.calls[1][2];

    expect(first).not.toBe(second);
    expect(mocks.createServerClient).toHaveBeenCalledTimes(2);
    expect(firstOptions.cookies.getAll()).toEqual([
      { name: 'first', value: '1' },
    ]);
    expect(secondOptions.cookies.getAll()).toEqual([
      { name: 'second', value: '2' },
    ]);
  });

  it('aplica atualizações de cookies quando o contexto permite', async () => {
    const store = { getAll: vi.fn(() => []), set: vi.fn() };
    mocks.cookies.mockResolvedValue(store);
    mocks.createServerClient.mockReturnValue({ client: 'server' });

    await createSupabaseServerClient();
    const options = mocks.createServerClient.mock.calls[0][2];
    options.cookies.setAll([
      { name: 'session', value: 'updated', options: { path: '/' } },
    ]);

    expect(store.set).toHaveBeenCalledWith('session', 'updated', {
      path: '/',
    });
  });

  it('ignora somente a escrita proibida em Server Component', async () => {
    const store = {
      getAll: vi.fn(() => []),
      set: vi.fn(() => {
        throw new Error(
          'Cookies can only be modified in a Server Action or Route Handler.',
        );
      }),
    };
    mocks.cookies.mockResolvedValue(store);
    mocks.createServerClient.mockReturnValue({ client: 'server' });

    await createSupabaseServerClient();
    const options = mocks.createServerClient.mock.calls[0][2];

    expect(() =>
      options.cookies.setAll([
        { name: 'session', value: 'updated', options: {} },
      ]),
    ).not.toThrow();
  });

  it('não oculta erros inesperados de escrita', async () => {
    const store = {
      getAll: vi.fn(() => []),
      set: vi.fn(() => {
        throw new Error('falha inesperada');
      }),
    };
    mocks.cookies.mockResolvedValue(store);
    mocks.createServerClient.mockReturnValue({ client: 'server' });

    await createSupabaseServerClient();
    const options = mocks.createServerClient.mock.calls[0][2];

    expect(() =>
      options.cookies.setAll([
        { name: 'session', value: 'updated', options: {} },
      ]),
    ).toThrow('falha inesperada');
  });
});
