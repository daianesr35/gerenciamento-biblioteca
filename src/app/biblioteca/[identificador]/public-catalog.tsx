'use client';

import { useState } from 'react';

import { CoverPlaceholder } from '@/components/ui';
import type { PublicBook } from '@/types/public-library';

export function filterPublicBooks(
  books: readonly PublicBook[],
  search: string,
): readonly PublicBook[] {
  const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');
  return books.filter(
    (book) =>
      normalizedSearch.length === 0 ||
      book.title.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
      book.author.toLocaleLowerCase('pt-BR').includes(normalizedSearch),
  );
}

export function PublicCatalog({ books }: { books: readonly PublicBook[] }) {
  const [search, setSearch] = useState('');
  const filteredBooks = filterPublicBooks(books, search);

  return (
    <>
      <div className="public-catalog-tools">
        <div className="public-book-search">
          <label className="sr-only" htmlFor="public-book-search">
            Pesquisar por título ou autor
          </label>
          <input
            id="public-book-search"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pesquisar por título ou autor..."
            type="search"
            value={search}
          />
        </div>
      </div>
      <section className="public-books" aria-labelledby="public-books-title">
        <div className="section-heading">
          <h2 id="public-books-title">Livros disponíveis</h2>
        </div>
        <div className="public-book-grid public-catalog-grid">
          {filteredBooks.map((book) => (
            <article className="public-book" key={book.id}>
              {book.coverImageUrl ? (
                // A URL é um dado bibliográfico e pode ter qualquer host.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={`Capa de ${book.title}`}
                  className="public-cover public-cover-image"
                  src={book.coverImageUrl}
                />
              ) : (
                <CoverPlaceholder
                  label={`Capa indisponível de ${book.title}`}
                />
              )}
              <h3>{book.title}</h3>
              <p>{book.author}</p>
              {book.publisher && (
                <p className="public-book-publisher">{book.publisher}</p>
              )}
            </article>
          ))}
        </div>
        {filteredBooks.length === 0 && (
          <p className="public-books-empty" role="status">
            Nenhum livro encontrado para esta pesquisa.
          </p>
        )}
      </section>
    </>
  );
}
