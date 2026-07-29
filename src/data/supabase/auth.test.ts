import { beforeEach, describe, expect, it, vi } from 'vitest';

const createSupabaseServerClient = vi.hoisted(() => vi.fn());

vi.mock('@/data/supabase/server', () => ({
  createSupabaseServerClient,
}));

import { getServerAuthIdentity, signInOwner, signUpOwner } from './auth';

beforeEach(() => {
  createSupabaseServerClient.mockReset();
});

describe('cadastro no Supabase Auth', () => {
  it('envia somente o nome como metadata de perfil', async () => {
    const signUp = vi.fn(async () => ({
      data: { user: { id: 'user-id' }, session: {} },
      error: null,
    }));
    createSupabaseServerClient.mockResolvedValue({ auth: { signUp } });

    await expect(
      signUpOwner({
        name: 'Maria da Silva',
        email: 'maria@example.com',
        password: '123456',
      }),
    ).resolves.toEqual({ hasSession: true });
    expect(signUp).toHaveBeenCalledWith({
      email: 'maria@example.com',
      password: '123456',
      options: {
        data: {
          nome: 'Maria da Silva',
        },
      },
    });
  });

  it('preserva o erro para normalização pelo serviço', async () => {
    const providerError = {
      code: 'unexpected_failure',
      message: 'Database error saving new user',
    };
    createSupabaseServerClient.mockResolvedValue({
      auth: {
        signUp: vi.fn(async () => ({
          data: { user: null, session: null },
          error: providerError,
        })),
      },
    });

    await expect(
      signUpOwner({
        name: 'Maria',
        email: 'maria@example.com',
        password: '123456',
      }),
    ).rejects.toBe(providerError);
  });

  it('falha com segurança quando o provedor não retorna usuário', async () => {
    createSupabaseServerClient.mockResolvedValue({
      auth: {
        signUp: vi.fn(async () => ({
          data: { user: null, session: null },
          error: null,
        })),
      },
    });

    await expect(
      signUpOwner({
        name: 'Maria',
        email: 'maria@example.com',
        password: '123456',
      }),
    ).rejects.toEqual({ code: 'unexpected_failure' });
  });
});

describe('identidade autenticada no servidor', () => {
  it('mapeia claims verificadas para o contrato mínimo da aplicação', async () => {
    createSupabaseServerClient.mockResolvedValue({
      auth: {
        getClaims: vi.fn(async () => ({
          data: {
            claims: {
              sub: 'user-id',
              email: 'pessoa@example.com',
              user_metadata: { role: 'ignorado' },
            },
          },
          error: null,
        })),
      },
    });

    await expect(getServerAuthIdentity()).resolves.toEqual({
      status: 'authenticated',
      identity: {
        userId: 'user-id',
        email: 'pessoa@example.com',
      },
    });
  });

  it('retorna contrato anônimo quando não há identidade verificável', async () => {
    createSupabaseServerClient.mockResolvedValue({
      auth: {
        getClaims: vi.fn(async () => ({
          data: null,
          error: new Error('Auth session missing'),
        })),
      },
    });

    await expect(getServerAuthIdentity()).resolves.toEqual({
      status: 'anonymous',
      identity: null,
    });
  });
});

describe('login no Supabase Auth', () => {
  it('chama signInWithPassword com e-mail e senha', async () => {
    const signInWithPassword = vi.fn(async () => ({
      data: { user: { id: 'user-id' }, session: {} },
      error: null,
    }));
    createSupabaseServerClient.mockResolvedValue({
      auth: { signInWithPassword },
    });

    await expect(
      signInOwner({
        email: 'maria@example.com',
        password: 'senha-segura',
      }),
    ).resolves.toBeUndefined();
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'maria@example.com',
      password: 'senha-segura',
    });
  });

  it('preserva o erro para normalização pelo serviço', async () => {
    const providerError = {
      code: 'invalid_credentials',
      message: 'Invalid login credentials',
    };
    createSupabaseServerClient.mockResolvedValue({
      auth: {
        signInWithPassword: vi.fn(async () => ({
          data: { user: null, session: null },
          error: providerError,
        })),
      },
    });

    await expect(
      signInOwner({
        email: 'maria@example.com',
        password: 'senha-incorreta',
      }),
    ).rejects.toBe(providerError);
  });
});
