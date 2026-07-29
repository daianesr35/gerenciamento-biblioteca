import { beforeEach, describe, expect, it, vi } from 'vitest';

const signInOwner = vi.hoisted(() => vi.fn());

vi.mock('@/data/supabase/auth', () => ({
  signInOwner,
}));

import { loginAction } from './actions';

beforeEach(() => {
  signInOwner.mockReset();
});

function loginData(values: { email?: string; password?: string }): FormData {
  const formData = new FormData();
  Object.entries(values).forEach(([field, value]) => {
    if (value !== undefined) {
      formData.set(field, value);
    }
  });
  return formData;
}

describe('Server Action de login', () => {
  it('repete a validação no servidor', async () => {
    const result = await loginAction(
      { status: 'idle' },
      loginData({ email: 'inválido', password: '' }),
    );

    expect(result).toEqual({
      status: 'invalid',
      fieldErrors: {
        email: 'Informe um e-mail válido.',
        password: 'Informe sua senha.',
      },
    });
    expect(signInOwner).not.toHaveBeenCalled();
  });

  it('usa o adaptador com as credenciais normalizadas', async () => {
    signInOwner.mockResolvedValue(undefined);

    await expect(
      loginAction(
        { status: 'idle' },
        loginData({
          email: ' MARIA@EXAMPLE.COM ',
          password: 'senha-segura',
        }),
      ),
    ).resolves.toEqual({ status: 'authenticated' });
    expect(signInOwner).toHaveBeenCalledWith({
      email: 'maria@example.com',
      password: 'senha-segura',
    });
  });
});
