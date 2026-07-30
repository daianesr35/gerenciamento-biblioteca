import { describe, expect, it, vi } from 'vitest';

import { buildPublicLibraryUrl, getOwnPublicPage } from './public-page';

describe('compartilhamento da Página Pública', () => {
  it('constrói a URL sem depender do navegador ou duplicar barras', () => {
    expect(
      buildPublicLibraryUrl(
        'https://biblioteca.example/base/',
        '123e4567-e89b-42d3-a456-426614174000',
      ),
    ).toBe(
      'https://biblioteca.example/base/biblioteca/123e4567-e89b-42d3-a456-426614174000',
    );
  });

  it('retorna a URL da Biblioteca autenticada', async () => {
    const getIdentifier = vi.fn().mockResolvedValue('biblioteca da daiane');

    await expect(
      getOwnPublicPage(getIdentifier, () => 'https://biblioteca.example/'),
    ).resolves.toEqual({
      status: 'success',
      publicUrl:
        'https://biblioteca.example/biblioteca/biblioteca%20da%20daiane',
    });
  });

  it('converte falhas em erro seguro', async () => {
    await expect(
      getOwnPublicPage(
        async () => {
          throw new Error('detalhe interno');
        },
        () => 'https://biblioteca.example',
      ),
    ).resolves.toEqual({ status: 'error', category: 'unavailable' });
  });
});
