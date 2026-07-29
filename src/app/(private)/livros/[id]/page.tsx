import Link from 'next/link';
import type { ReactNode } from 'react';

import { Badge, ButtonLink, Card, CoverPlaceholder } from '@/components/ui';
import { getOwnBookById } from '@/services/books';

type DetailIcon = 'arrow' | 'book' | 'edit' | 'isbn' | 'person';

function Icon({ type }: { type: DetailIcon }) {
  const paths: Record<DetailIcon, ReactNode> = {
    arrow: <path d="m15 18-6-6 6-6M9 12h12" />,
    book: (
      <>
        <path d="M11 5H6a3 3 0 0 0-3 3v12a3 3 0 0 1 3-3h5a5 5 0 0 1 4 2V8a5 5 0 0 0-4-3Z" />
        <path d="M19 5h-3v14a5 5 0 0 1 4-2h1V7a2 2 0 0 0-2-2Z" />
      </>
    ),
    edit: (
      <>
        <path d="m4 20 4-1 11-11a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" />
        <path d="m14 7 3 3" />
      </>
    ),
    isbn: <path d="M4 4v16M8 4v16M12 4v16M16 4v16M20 4v16" />,
    person: (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 21c0-5 2-8 7-8s7 3 7 8" />
      </>
    ),
  };

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
}

function MetaItem({
  icon,
  label,
  children,
}: {
  icon: DetailIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="book-detail-meta-item">
      <span className="book-detail-icon">
        <Icon type={icon} />
      </span>
      <div>
        <dt>{label}</dt>
        <dd>{children}</dd>
      </div>
    </div>
  );
}

function DetailState({ message }: { message: string }) {
  return (
    <div className="book-detail-page">
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link href="/biblioteca">Livros</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Detalhes do livro</span>
      </nav>
      <header className="book-detail-heading">
        <div>
          <h1>Detalhes do livro</h1>
          <p>{message}</p>
        </div>
        <ButtonLink href="/biblioteca">
          <Icon type="arrow" />
          Voltar para a biblioteca
        </ButtonLink>
      </header>
    </div>
  );
}

export default async function BookDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getOwnBookById(id);

  if (result.status === 'invalid_id' || result.status === 'not_found') {
    return <DetailState message="Livro não encontrado." />;
  }

  if (result.status === 'error') {
    return (
      <DetailState message="Não foi possível carregar o livro. Tente novamente." />
    );
  }

  const { book } = result;
  const available = book.status === 'disponivel';
  const statusLabel = available ? 'Disponível' : 'Emprestado';

  return (
    <div className="book-detail-page">
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link href="/biblioteca">Livros</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Detalhes do livro</span>
      </nav>
      <header className="book-detail-heading">
        <div>
          <h1>Detalhes do livro</h1>
          <p>Visualize as informações do livro.</p>
        </div>
        <div className="book-detail-heading-actions">
          <ButtonLink href="/biblioteca">
            <Icon type="arrow" />
            Voltar para a biblioteca
          </ButtonLink>
          <ButtonLink href={`/livros/${book.id}/editar`}>
            <Icon type="edit" />
            Editar
          </ButtonLink>
        </div>
      </header>

      <Card className="book-detail-summary">
        <div className="book-detail-cover">
          {book.coverImageUrl ? (
            // A URL é um dado bibliográfico e pode ter qualquer host.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={`Capa de ${book.title}`}
              className="book-detail-cover-image"
              src={book.coverImageUrl}
            />
          ) : (
            <CoverPlaceholder label={`Capa indisponível de ${book.title}`} />
          )}
          <Badge tone={available ? 'success' : 'warning'}>{statusLabel}</Badge>
        </div>
        <div className="book-detail-copy">
          <h2>{book.title}</h2>
          <p className="book-detail-author">
            <Icon type="person" />
            {book.author}
          </p>
          <dl className="book-detail-meta">
            <MetaItem icon="isbn" label="ISBN">
              {book.isbn ?? 'Não informado'}
            </MetaItem>
            <MetaItem icon="book" label="Editora">
              {book.publisher ?? 'Não informado'}
            </MetaItem>
          </dl>
        </div>
      </Card>
    </div>
  );
}
