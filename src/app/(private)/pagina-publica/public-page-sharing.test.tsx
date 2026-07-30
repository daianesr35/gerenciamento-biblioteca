import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import {
  copyPublicLink,
  openPublicPage,
  PublicPageSharing,
} from './public-page-sharing';

const PUBLIC_URL = 'https://biblioteca.example/biblioteca/identificador';

describe('ações de compartilhamento', () => {
  it('renderiza a URL, o QR Code e as duas ações', () => {
    const html = renderToStaticMarkup(
      <PublicPageSharing publicUrl={PUBLIC_URL} />,
    );

    expect(html).toContain(`value="${PUBLIC_URL}"`);
    expect(html).toContain('QR Code da Página Pública');
    expect(html).toContain('Copiar link público');
    expect(html).toContain('Abrir Página Pública');
  });

  it('copia a URL e informa falhas da área de transferência', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    await expect(copyPublicLink(PUBLIC_URL, writeText)).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith(PUBLIC_URL);

    await expect(
      copyPublicLink(PUBLIC_URL, vi.fn().mockRejectedValue(new Error('falha'))),
    ).resolves.toBe(false);
  });

  it('abre a Página Pública em nova aba sem acesso à janela de origem', () => {
    const open = vi.fn();
    openPublicPage(PUBLIC_URL, open);

    expect(open).toHaveBeenCalledWith(
      PUBLIC_URL,
      '_blank',
      'noopener,noreferrer',
    );
  });
});
