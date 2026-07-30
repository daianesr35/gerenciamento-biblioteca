'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button, CoverPlaceholder, Input } from '@/components/ui';
import type { PublicLoanRequestActionState } from '@/types/loan-requests';
import type { PublicBook } from '@/types/public-library';

import { requestLoanAction } from './actions';

const INITIAL_REQUEST_STATE: PublicLoanRequestActionState = { status: 'idle' };

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

function SubmitRequestButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" variant="primary">
      {pending ? 'Enviando solicitação…' : 'Enviar solicitação'}
    </Button>
  );
}

function PublicRequestForm({
  book,
  publicIdentifier,
  onCreated,
}: {
  book: PublicBook;
  publicIdentifier: string;
  onCreated: () => void;
}) {
  async function submitRequest(
    previousState: PublicLoanRequestActionState,
    formData: FormData,
  ): Promise<PublicLoanRequestActionState> {
    const result = await requestLoanAction(previousState, formData);

    if (result.status === 'created') {
      onCreated();
    }

    return result;
  }

  const [requestState, requestAction] = useActionState(
    submitRequest,
    INITIAL_REQUEST_STATE,
  );
  const fieldErrors =
    requestState.status === 'invalid' ? requestState.fieldErrors : {};
  const requestError =
    requestState.status === 'error'
      ? requestState.category === 'book_unavailable'
        ? 'Este livro não está mais disponível. Escolha outro livro e tente novamente.'
        : 'Não foi possível enviar a solicitação. Tente novamente.'
      : null;

  return (
    <>
      <div className="section-heading">
        <div>
          <h2 id="public-request-title">Solicitar empréstimo</h2>
          <p>
            Livro selecionado: <strong>{book.title}</strong>
          </p>
        </div>
      </div>
      <form action={requestAction}>
        <input name="publicIdentifier" type="hidden" value={publicIdentifier} />
        <input name="bookId" type="hidden" value={book.id} />
        <Input
          autoComplete="name"
          error={fieldErrors.requesterName}
          label="Nome"
          name="requesterName"
          required
        />
        <Input
          autoComplete="tel"
          error={fieldErrors.requesterPhone}
          label="Telefone"
          name="requesterPhone"
          required
          type="tel"
        />
        {requestError && (
          <p
            aria-live="polite"
            className="public-request-message error"
            role="alert"
          >
            {requestError}
          </p>
        )}
        <SubmitRequestButton />
      </form>
    </>
  );
}

export function PublicCatalog({
  books,
  publicIdentifier,
}: {
  books: readonly PublicBook[];
  publicIdentifier: string;
}) {
  const [search, setSearch] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const requestSectionRef = useRef<HTMLElement>(null);
  const filteredBooks = filterPublicBooks(books, search);
  const selectedBook = books.find((book) => book.id === selectedBookId);

  useEffect(() => {
    if (!selectedBook) {
      return;
    }

    requestSectionRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'start',
    });
  }, [selectedBook]);

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
            <article
              className={`public-book ${
                selectedBookId === book.id ? 'selected' : ''
              }`}
              key={book.id}
            >
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
              <Button
                aria-pressed={selectedBookId === book.id}
                onClick={() => {
                  setRequestSubmitted(false);
                  setSelectedBookId(book.id);
                }}
                type="button"
                variant={selectedBookId === book.id ? 'primary' : 'secondary'}
              >
                {selectedBookId === book.id ? 'Selecionado' : 'Solicitar'}
              </Button>
            </article>
          ))}
        </div>
        {filteredBooks.length === 0 && (
          <p className="public-books-empty" role="status">
            Nenhum livro encontrado para esta pesquisa.
          </p>
        )}
      </section>
      {selectedBook && (
        <section
          aria-labelledby="public-request-title"
          className="public-request"
          ref={requestSectionRef}
        >
          <PublicRequestForm
            book={selectedBook}
            onCreated={() => {
              setSelectedBookId('');
              setRequestSubmitted(true);
            }}
            publicIdentifier={publicIdentifier}
          />
        </section>
      )}
      {requestSubmitted && (
        <p
          aria-live="polite"
          className="public-request-message public-request-success success"
          role="status"
        >
          Solicitação enviada com sucesso.
        </p>
      )}
    </>
  );
}
