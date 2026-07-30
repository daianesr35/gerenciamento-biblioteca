'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useState, type ReactNode } from 'react';

import { Button } from '@/components/ui';

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      {children}
    </svg>
  );
}

export async function copyPublicLink(
  publicUrl: string,
  writeText: (value: string) => Promise<void> = (value) =>
    navigator.clipboard.writeText(value),
): Promise<boolean> {
  try {
    await writeText(publicUrl);
    return true;
  } catch {
    return false;
  }
}

export function openPublicPage(
  publicUrl: string,
  open: (url: string, target: string, features: string) => unknown = (
    url,
    target,
    features,
  ) => window.open(url, target, features),
): void {
  open(publicUrl, '_blank', 'noopener,noreferrer');
}

export function PublicPageSharing({ publicUrl }: { publicUrl: string }) {
  const [copyFeedback, setCopyFeedback] = useState('');

  async function handleCopy() {
    const copied = await copyPublicLink(publicUrl);
    setCopyFeedback(
      copied ? 'Link copiado!' : 'Não foi possível copiar o link.',
    );
  }

  return (
    <aside className="public-aside" aria-label="Compartilhamento da página">
      <section className="public-side-card">
        <h2>Compartilhe sua página</h2>
        <p>Qualquer pessoa com o link pode visualizar sua biblioteca.</p>
        <div className="public-link">
          <label className="sr-only" htmlFor="public-link">
            Link público
          </label>
          <input id="public-link" readOnly value={publicUrl} />
          <button
            aria-label="Copiar link público"
            onClick={handleCopy}
            type="button"
          >
            <Icon>
              <rect height="14" rx="2" width="12" x="8" y="7" />
              <path d="M16 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h2" />
            </Icon>
          </button>
        </div>
        <p aria-live="polite" className="public-copy-feedback" role="status">
          {copyFeedback}
        </p>
      </section>

      <section className="public-side-card public-qr-card">
        <h2>QR Code</h2>
        <p>Escaneie para acessar sua Página Pública.</p>
        <div className="public-qr">
          <QRCodeSVG
            aria-label="QR Code da Página Pública"
            role="img"
            size={176}
            title="QR Code da Página Pública"
            value={publicUrl}
          />
        </div>
        <Button
          onClick={() => openPublicPage(publicUrl)}
          type="button"
          variant="primary"
        >
          Abrir Página Pública
          <span aria-hidden="true">↗</span>
        </Button>
      </section>
    </aside>
  );
}
