import Link from 'next/link';

import { Badge, Card, CoverPlaceholder } from '@/components/ui';
import type { MockBook } from '@/data/mock/library';

function CardActionIcon({ type }: { type: 'view' | 'edit' | 'more' }) {
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
    more: (
      <>
        <circle cx="12" cy="5" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="19" r="1" />
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
  book: MockBook;
  compactActions?: boolean;
}) {
  return (
    <Card className="book-card">
      <CoverPlaceholder label={`Capa indisponível de ${book.title}`} />
      <div className="book-card-copy">
        <h3>{book.title}</h3>
        <p>{book.author}</p>
        <Badge tone={book.status === 'Disponível' ? 'success' : 'warning'}>
          {book.status}
        </Badge>
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
            <button
              aria-label={`Mais ações para ${book.title}`}
              className="button book-icon-button"
              type="button"
            >
              <CardActionIcon type="more" />
            </button>
          </>
        )}
      </div>
    </Card>
  );
}
