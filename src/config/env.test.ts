import { afterEach, describe, expect, it } from 'vitest';

import { getGoogleBooksEnvironment, getPublicEnvironment } from './env';

const originalEnvironment = process.env;

afterEach(() => {
  process.env = originalEnvironment;
});

describe('getPublicEnvironment', () => {
  it('retorna as variáveis públicas configuradas', () => {
    process.env = {
      ...originalEnvironment,
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example',
    };

    expect(getPublicEnvironment()).toEqual({
      appUrl: 'http://localhost:3000',
      supabaseUrl: 'https://example.supabase.co',
      supabasePublishableKey: 'sb_publishable_example',
    });
  });

  it('falha de forma explícita quando falta uma variável', () => {
    process.env = { NODE_ENV: 'test' };

    expect(() => getPublicEnvironment()).toThrow(
      'Variável de ambiente obrigatória ausente: NEXT_PUBLIC_APP_URL',
    );
  });
});

describe('getGoogleBooksEnvironment', () => {
  it('retorna a chave privada configurada no servidor', () => {
    process.env = {
      ...originalEnvironment,
      GOOGLE_BOOKS_API_KEY: 'google-books-example',
    };

    expect(getGoogleBooksEnvironment()).toEqual({
      apiKey: 'google-books-example',
    });
  });

  it('falha de forma explícita quando a chave está ausente', () => {
    process.env = { NODE_ENV: 'test' };

    expect(() => getGoogleBooksEnvironment()).toThrow(
      'Variável de ambiente obrigatória ausente: GOOGLE_BOOKS_API_KEY',
    );
  });
});
