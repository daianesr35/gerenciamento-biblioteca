import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getOwnPublicPage } from '@/services/public-page';

import LoadingPublicPage from './loading';
import PublicPage from './page';

vi.mock('@/services/public-page', () => ({
  getOwnPublicPage: vi.fn(),
}));

const getOwnPublicPageMock = vi.mocked(getOwnPublicPage);

describe('Página Pública privada', () => {
  beforeEach(() => getOwnPublicPageMock.mockReset());

  it('preserva o banner e exibe somente o compartilhamento funcional', async () => {
    getOwnPublicPageMock.mockResolvedValue({
      status: 'success',
      publicUrl: 'https://biblioteca.example/biblioteca/id',
    });

    const html = renderToStaticMarkup(await PublicPage());

    expect(html).toContain('Sua biblioteca pessoal');
    expect(html).toContain('Compartilhe sua página');
    expect(html).toContain('QR Code');
    expect(html).not.toContain('Baixar QR Code');
    expect(html).not.toContain('Personalização');
    expect(html).not.toContain('Solicitações');
    expect(html).not.toContain('Configurações');
  });

  it('exibe erro simples sem detalhes técnicos', async () => {
    getOwnPublicPageMock.mockResolvedValue({
      status: 'error',
      category: 'unavailable',
    });

    const html = renderToStaticMarkup(await PublicPage());
    expect(html).toContain('Não foi possível carregar sua Página Pública.');
    expect(html).not.toContain('unavailable');
  });

  it('exibe o estado de carregamento da rota', () => {
    const html = renderToStaticMarkup(<LoadingPublicPage />);
    expect(html).toContain('Carregando Página Pública...');
    expect(html).toContain('aria-busy="true"');
  });
});
