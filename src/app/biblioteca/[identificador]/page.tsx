import { getPublicLibrary } from '@/services/public-library';

import { PublicCatalog } from './public-catalog';

type PublicLibraryPageProps = Readonly<{
  params: Promise<{ identificador: string }>;
}>;

function BookIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M12 6c-2.6-2.2-5.7-2.6-9-1.5v13c3.3-1.1 6.4-.7 9 1.5m0-13c2.6-2.2 5.7-2.6 9-1.5v13c-3.3-1.1-6.4-.7-9 1.5m0-13v13" />
    </svg>
  );
}

export default async function PublicLibraryPage({
  params,
}: PublicLibraryPageProps) {
  const { identificador } = await params;
  const result = await getPublicLibrary(identificador);

  if (result.status === 'invalid_id' || result.status === 'not_found') {
    return (
      <main className="public-route-state">
        <h1>Biblioteca não encontrada</h1>
        <p>Verifique o endereço informado.</p>
      </main>
    );
  }

  if (result.status === 'error') {
    return (
      <main className="public-route-state">
        <h1>Biblioteca pessoal</h1>
        <p>Não foi possível carregar a biblioteca. Tente novamente.</p>
      </main>
    );
  }

  return (
    <main className="public-page public-route">
      <section className="public-library-card" aria-labelledby="library-name">
        <div className="public-banner">
          <span aria-hidden="true" className="public-library-mark">
            <BookIcon />
          </span>
          <div>
            <h1 id="library-name">Biblioteca pessoal</h1>
            <p>Livros disponíveis para consulta.</p>
          </div>
        </div>
        {result.status === 'empty' ? (
          <p className="public-books-empty" role="status">
            Esta biblioteca ainda não possui livros disponíveis.
          </p>
        ) : (
          <PublicCatalog books={result.books} />
        )}
      </section>
    </main>
  );
}
