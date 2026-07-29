import { describe, expect, it, vi } from 'vitest';

import {
  hasRequiredValue,
  loginOwner,
  normalizeAuthError,
  normalizeEmail,
  normalizeName,
  registerOwner,
  validateEmail,
  validateName,
  validatePassword,
} from './auth';

describe('validações de autenticação', () => {
  it('normaliza e-mail com espaços e caixa inconsistente', () => {
    expect(normalizeEmail('  Pessoa@Example.COM  ')).toBe('pessoa@example.com');
  });

  it('preserva e-mail já normalizado', () => {
    expect(normalizeEmail('pessoa@example.com')).toBe('pessoa@example.com');
  });

  it('rejeita e-mail inválido e campo vazio', () => {
    expect(validateEmail('pessoa@')).toEqual({
      valid: false,
      error: 'invalid_email',
    });
    expect(validateEmail('   ')).toEqual({
      valid: false,
      error: 'required',
    });
    expect(hasRequiredValue('   ')).toBe(false);
  });

  it('normaliza nome e rejeita nome somente com espaços', () => {
    expect(normalizeName('  Maria   da Silva  ')).toBe('Maria da Silva');
    expect(validateName('   ')).toEqual({
      valid: false,
      error: 'required',
    });
  });

  it('preserva nome válido e retorna valor normalizado', () => {
    expect(validateName('Maria da Silva')).toEqual({
      valid: true,
      value: 'Maria da Silva',
    });
    expect(validateEmail('  MARIA@EXAMPLE.COM ')).toEqual({
      valid: true,
      value: 'maria@example.com',
    });
  });

  it('rejeita senha vazia ou menor que a política local', () => {
    expect(validatePassword('')).toEqual({
      valid: false,
      error: 'required',
    });
    expect(validatePassword('12345')).toEqual({
      valid: false,
      error: 'invalid_password',
    });
  });

  it('normaliza erros sem expor mensagem ou detalhes técnicos', () => {
    expect(
      normalizeAuthError({
        code: 'invalid_credentials',
        message: 'senha-secreta token-secreto',
      }),
    ).toEqual({
      category: 'invalid_credentials',
    });
    expect(normalizeAuthError(new Error('detalhe técnico sensível'))).toEqual({
      category: 'unknown',
    });
    expect(normalizeAuthError({ code: 'over_request_rate_limit' })).toEqual({
      category: 'rate_limited',
    });
  });
});

describe('cadastro de proprietário', () => {
  it.each([
    {
      input: { name: '   ', email: 'maria@example.com', password: '123456' },
      field: 'name',
    },
    {
      input: { name: 'Maria', email: 'maria@', password: '123456' },
      field: 'email',
    },
    {
      input: { name: 'Maria', email: 'maria@example.com', password: '' },
      field: 'password',
    },
  ])('rejeita entrada inválida no campo $field', async ({ input, field }) => {
    const signUp = vi.fn();

    const result = await registerOwner(input, signUp);

    expect(result.status).toBe('invalid');
    expect(result).toHaveProperty(`fieldErrors.${field}`);
    expect(signUp).not.toHaveBeenCalled();
  });

  it('normaliza entrada válida e retorna sucesso com sessão', async () => {
    const signUp = vi.fn(async () => ({ hasSession: true }));

    await expect(
      registerOwner(
        {
          name: '  Maria   da Silva ',
          email: ' MARIA@EXAMPLE.COM ',
          password: '123456',
        },
        signUp,
      ),
    ).resolves.toEqual({ status: 'authenticated' });
    expect(signUp).toHaveBeenCalledWith({
      name: 'Maria da Silva',
      email: 'maria@example.com',
      password: '123456',
    });
  });

  it('orienta confirmação quando o cadastro não retorna sessão', async () => {
    const signUp = vi.fn(async () => ({ hasSession: false }));

    await expect(
      registerOwner(
        {
          name: 'Maria',
          email: 'maria@example.com',
          password: '123456',
        },
        signUp,
      ),
    ).resolves.toEqual({ status: 'confirmation_required' });
  });

  it('normaliza erro sem expor detalhes do provedor', async () => {
    const signUp = vi.fn(async () => {
      throw {
        code: 'user_already_exists',
        message: 'detalhe técnico que não deve sair do serviço',
      };
    });

    await expect(
      registerOwner(
        {
          name: 'Maria',
          email: 'maria@example.com',
          password: '123456',
        },
        signUp,
      ),
    ).resolves.toEqual({
      status: 'error',
      category: 'invalid_signup',
    });
  });
});

describe('login de proprietário', () => {
  it('normaliza o e-mail e autentica credenciais válidas', async () => {
    const signIn = vi.fn(async () => undefined);

    await expect(
      loginOwner(
        {
          email: ' MARIA@EXAMPLE.COM ',
          password: 'senha-segura',
        },
        signIn,
      ),
    ).resolves.toEqual({ status: 'authenticated' });
    expect(signIn).toHaveBeenCalledWith({
      email: 'maria@example.com',
      password: 'senha-segura',
    });
  });

  it('rejeita e-mail inválido antes de chamar o provedor', async () => {
    const signIn = vi.fn();

    await expect(
      loginOwner({ email: 'maria@', password: 'senha-segura' }, signIn),
    ).resolves.toEqual({
      status: 'invalid',
      fieldErrors: { email: 'Informe um e-mail válido.' },
    });
    expect(signIn).not.toHaveBeenCalled();
  });

  it('normaliza senha inválida sem expor detalhes do provedor', async () => {
    const signIn = vi.fn(async () => {
      throw {
        code: 'invalid_credentials',
        message: 'Invalid login credentials',
      };
    });

    await expect(
      loginOwner(
        { email: 'maria@example.com', password: 'senha-incorreta' },
        signIn,
      ),
    ).resolves.toEqual({
      status: 'error',
      category: 'invalid_credentials',
    });
  });

  it('normaliza erro inesperado sem expor a mensagem original', async () => {
    const signIn = vi.fn(async () => {
      throw new Error('detalhe técnico sensível');
    });

    await expect(
      loginOwner(
        { email: 'maria@example.com', password: 'senha-segura' },
        signIn,
      ),
    ).resolves.toEqual({
      status: 'error',
      category: 'unknown',
    });
  });
});
