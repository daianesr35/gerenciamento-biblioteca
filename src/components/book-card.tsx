import Link from 'next/link';

import { Badge, Card, CoverPlaceholder } from '@/components/ui';

type BookCardBook = Readonly<{
  id: string;
  title: string;
  author: string;
  coverImageUrl?: string | null;
  status: 'disponivel' | 'emprestado' | 'Disponível' | 'Emprestado';
}>;

function CardActionIcon({ type }: { type: 'view' | 'edit' }) {
  const paths = {
    view: (
      <>
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    edit: (
      <>
        <path d="m14.5 5.5 4 4M4 20l4.5-1 10-10a2.8 2.8 0 0 0-4-4l-10 10L4 20Z" />
        <path d="m13 7 4 4" />
      </>
    ),
  } as const;

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
}

export function BookCard({
  book,
  compactActions = false,
}: {
  book: BookCardBook;
  compactActions?: boolean;
}) {
  const isAvailable =
    book.status === 'disponivel' || book.status === 'Disponível';
  const statusLabel = isAvailable ? 'Disponível' : 'Emprestado';

  return (
    <Card className="book-card">
      {book.coverImageUrl ? (
        // A URL é um dado bibliográfico e pode ter qualquer host.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={`Capa de ${book.title}`}
          className="book-cover"
          src={book.coverImageUrl}
        />
      ) : (
        <CoverPlaceholder label={`Capa indisponível de ${book.title}`} />
      )}
      <div className="book-card-copy">
        <h3>{book.title}</h3>
        <p>{book.author}</p>
        <Badge tone={isAvailable ? 'success' : 'warning'}>{statusLabel}</Badge>
      </div>
      <div className="actions">
        <Link
          aria-label={`Ver detalhes de ${book.title}`}
          className={`button ${compactActions ? 'book-icon-button' : ''}`}
          href={`/livros/${book.id}`}
        >
          {compactActions ? <CardActionIcon type="view" /> : 'Ver detalhes'}
        </Link>
        {compactActions && (
          <>
            <Link
              aria-label={`Editar ${book.title}`}
              className="button book-icon-button"
              href={`/livros/${book.id}/editar`}
            >
              <CardActionIcon type="edit" />
            </Link>
          </>
        )}
      </div>
    </Card>
  );
}
