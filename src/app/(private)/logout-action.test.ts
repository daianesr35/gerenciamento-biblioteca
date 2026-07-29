import { beforeEach, describe, expect, it, vi } from 'vitest';

const signOutOwner = vi.hoisted(() => vi.fn());
const redirect = vi.hoisted(() => vi.fn());

vi.mock('@/data/supabase/auth', () => ({
  signOutOwner,
}));

vi.mock('next/navigation', () => ({
  redirect,
}));

import { logoutAction } from './logout-action';

beforeEach(() => {
  signOutOwner.mockReset();
  redirect.mockReset();
});

describe('Server Action de logout', () => {
  it('encerra a sessão e redireciona para o Login', async () => {
    signOutOwner.mockResolvedValue(undefined);

    await logoutAction({ status: 'idle' });

    expect(signOutOwner).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('retorna mensagem segura e não redireciona quando falha', async () => {
    signOutOwner.mockRejectedValue(
      new Error('token e detalhe interno do Supabase'),
    );

    await expect(logoutAction({ status: 'idle' })).resolves.toEqual({
      status: 'error',
      message: 'Não foi possível sair. Tente novamente.',
    });
    expect(redirect).not.toHaveBeenCalled();
  });
});
