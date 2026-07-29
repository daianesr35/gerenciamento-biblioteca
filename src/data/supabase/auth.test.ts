import { beforeEach, describe, expect, it, vi } from 'vitest';

const createSupabaseServerClient = vi.hoisted(() => vi.fn());

vi.mock('@/data/supabase/server', () => ({
  createSupabaseServerClient,
}));

import { getServerAuthIdentity } from './auth';

beforeEach(() => {
  createSupabaseServerClient.mockReset();
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
