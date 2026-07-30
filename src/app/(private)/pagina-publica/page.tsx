import type { ReactNode } from 'react';

import { getOwnPublicPage } from '@/services/public-page';

import { PublicPageSharing } from './public-page-sharing';

function BookIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M12 6c-2.6-2.2-5.7-2.6-9-1.5v13c3.3-1.1 6.4-.7 9 1.5m0-13c2.6-2.2 5.7-2.6 9-1.5v13c-3.3-1.1-6.4-.7-9 1.5m0-13v13" />
    </svg>
  );
}

function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="public-page">
      <header className="public-page-heading">
        <div>
          <h1>Página Pública</h1>
          <p>Compartilhe sua biblioteca com outras pessoas.</p>
        </div>
      </header>
      {children}
    </div>
  );
}

export default async function PublicPage() {
  const result = await getOwnPublicPage();

  if (result.status === 'error') {
    return (
      <PageFrame>
        <section className="card empty-state" role="alert">
          <h2>Não foi possível carregar sua Página Pública.</h2>
          <p>Tente novamente em instantes.</p>
        </section>
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <div className="public-layout">
        <main className="public-main">
          <section
            className="public-library-card"
            aria-labelledby="library-name"
          >
            <div className="public-banner">
              <span aria-hidden="true" className="public-library-mark">
                <BookIcon />
              </span>
              <div>
                <h2 id="library-name">Sua biblioteca pessoal</h2>
                <p>Livros que contam histórias e conectam pessoas.</p>
              </div>
            </div>
          </section>
        </main>

        <PublicPageSharing publicUrl={result.publicUrl} />
      </div>
    </PageFrame>
  );
}
