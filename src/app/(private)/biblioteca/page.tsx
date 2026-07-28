'use client';

import { useMemo, useState } from 'react';

import { BookCard } from '@/components/book-card';
import {
  ButtonLink,
  PageHeading,
  Pagination,
  SearchField,
  StatCard,
} from '@/components/ui';
import { books } from '@/data/mock/library';

function LibraryIcon({
  type,
}: {
  type: 'books' | 'available' | 'loaned' | 'requests' | 'filter';
}) {
  const paths = {
    books: (
      <>
        <path d="M12 7H7a3 3 0 0 0-3 3v15a3 3 0 0 1 3-3h5a6 6 0 0 1 5 3V10a6 6 0 0 0-5-3Z" />
        <path d="M22 7h5a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3h-5a6 6 0 0 0-5 3" />
      </>
    ),
    available: (
      <>
        <rect height="24" rx="2" width="18" x="7" y="5" />
        <path d="m12 17 3 3 6-7M28 9v18" />
      </>
    ),
    loaned: (
      <>
        <circle cx="12" cy="11" r="4" />
        <circle cx="23" cy="13" r="3" />
        <path d="M4 28c0-6 3-9 8-9s8 3 8 9M20 21c1-.7 2-1 4-1 4 0 6 3 6 7" />
      </>
    ),
    requests: (
      <>
        <rect height="24" rx="2" width="18" x="7" y="5" />
        <path d="M12 11h8M12 16h8M12 21h5" />
      </>
    ),
    filter: <path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z" />,
  } as const;

  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox={type === 'filter' ? '0 0 24 24' : '0 0 34 34'}
    >
      {paths[type]}
    </svg>
  );
}

export default function LibraryPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Todos');
  const filteredBooks = useMemo(
    () =>
      books.filter((book) => {
        const matchesQuery = `${book.title} ${book.author} ${book.category}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesStatus = status === 'Todos' || book.status === status;
        return matchesQuery && matchesStatus;
      }),
    [query, status],
  );

  return (
    <div className="library-page">
      <PageHeading
        action={
          <ButtonLink href="/livros/novo" variant="primary">
            <span aria-hidden="true">＋</span>
            Adicionar livro
          </ButtonLink>
        }
        description="Organize, encontre e gerencie todos os livros da sua coleção."
        title="Minha Biblioteca"
      />
      <div
        aria-label="Visão da biblioteca"
        className="library-collection-banner"
        role="img"
      />
      <div className="toolbar">
        <SearchField
          label="acervo"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por título, autor, ISBN ou categoria..."
          value={query}
        />
        <button className="button library-filter-button" type="button">
          <LibraryIcon type="filter" />
          Filtros
        </button>
        <label className="sr-only" htmlFor="status-livro">
          Filtrar por status
        </label>
        <select
          className="select"
          id="status-livro"
          onChange={(event) => setStatus(event.target.value)}
          value={status}
        >
          <option>Todos</option>
          <option>Disponível</option>
          <option>Emprestado</option>
        </select>
        <label className="sr-only" htmlFor="ordem-livro">
          Ordenar livros
        </label>
        <select className="select" defaultValue="recentes" id="ordem-livro">
          <option value="recentes">Ordenar por: Mais recentes</option>
          <option value="titulo">Ordenar por: Título</option>
          <option value="autor">Ordenar por: Autor</option>
        </select>
      </div>
      <div className="stats-grid">
        <StatCard
          icon={<LibraryIcon type="books" />}
          label="Total de livros"
          value="266"
        />
        <StatCard
          icon={<LibraryIcon type="available" />}
          label="Disponíveis"
          value="198"
        />
        <StatCard
          icon={<LibraryIcon type="loaned" />}
          label="Emprestados"
          value="28"
        />
        <StatCard
          icon={<LibraryIcon type="requests" />}
          label="Solicitações"
          value="5"
        />
      </div>
      {filteredBooks.length ? (
        <div className="book-grid">
          {filteredBooks.map((book) => (
            <BookCard book={book} compactActions key={book.id} />
          ))}
        </div>
      ) : (
        <section className="card empty-state">
          <span aria-hidden="true" className="cover-placeholder">
            ♧
          </span>
          <h2>Nenhum livro encontrado</h2>
          <p className="muted">Tente ajustar a pesquisa ou os filtros.</p>
        </section>
      )}
      <Pagination
        pageSize="12 por página"
        summary={`Mostrando 1 a ${filteredBooks.length} de 266 livros`}
      />
    </div>
  );
}
