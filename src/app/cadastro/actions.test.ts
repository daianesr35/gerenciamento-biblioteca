import { beforeEach, describe, expect, it, vi } from 'vitest';

const signUpOwner = vi.hoisted(() => vi.fn());

vi.mock('@/data/supabase/auth', () => ({
  signUpOwner,
}));

import { registerAction } from './actions';

beforeEach(() => {
  signUpOwner.mockReset();
});

function registrationData(values: {
  name?: string;
  email?: string;
  password?: string;
}): FormData {
  const formData = new FormData();
  Object.entries(values).forEach(([field, value]) => {
    if (value !== undefined) {
      formData.set(field, value);
    }
  });
  return formData;
}

describe('Server Action de cadastro', () => {
  it('repete a validação no servidor', async () => {
    const result = await registerAction(
      { status: 'idle' },
      registrationData({
        name: '',
        email: 'inválido',
        password: '',
      }),
    );

    expect(result).toEqual({
      status: 'invalid',
      fieldErrors: {
        name: 'Informe seu nome.',
        email: 'Informe um e-mail válido.',
        password: 'Informe uma senha.',
      },
    });
    expect(signUpOwner).not.toHaveBeenCalled();
  });

  it('usa o adaptador e retorna cadastro concluído', async () => {
    signUpOwner.mockResolvedValue(undefined);

    await expect(
      registerAction(
        { status: 'idle' },
        registrationData({
          name: '  Maria  ',
          email: ' MARIA@EXAMPLE.COM ',
          password: '123456',
        }),
      ),
    ).resolves.toEqual({ status: 'registered' });
    expect(signUpOwner).toHaveBeenCalledWith({
      name: 'Maria',
      email: 'maria@example.com',
      password: '123456',
    });
  });

  it('retorna somente erro normalizado', async () => {
    signUpOwner.mockRejectedValue({
      code: 'unexpected_failure',
      message: 'Database error saving new user',
    });

    await expect(
      registerAction(
        { status: 'idle' },
        registrationData({
          name: 'Maria',
          email: 'maria@example.com',
          password: '123456',
        }),
      ),
    ).resolves.toEqual({
      status: 'error',
      category: 'unavailable',
    });
  });
});
