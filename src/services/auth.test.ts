import { describe, expect, it } from 'vitest';

import {
  hasRequiredValue,
  normalizeAuthError,
  normalizeEmail,
  normalizeName,
  validateEmail,
  validateName,
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
