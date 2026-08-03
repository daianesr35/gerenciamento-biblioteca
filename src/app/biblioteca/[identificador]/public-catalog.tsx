'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button, CoverPlaceholder, Input } from '@/components/ui';
import {
  recommendBooks,
  type BookRecommendation,
} from '@/services/book-recommendations';
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

export function updateBookSelection(
  selectedBookIds: readonly string[],
  primaryBookId: string,
  bookId: string,
): Readonly<{
  selectedBookIds: readonly string[];
  primaryBookId: string;
}> {
  if (selectedBookIds.includes(bookId)) {
    const nextIds = selectedBookIds.filter((id) => id !== bookId);
    return {
      selectedBookIds: nextIds,
      primaryBookId:
        bookId === primaryBookId ? (nextIds[0] ?? '') : primaryBookId,
    };
  }

  return {
    selectedBookIds: [...selectedBookIds, bookId],
    primaryBookId: selectedBookIds.length === 0 ? bookId : primaryBookId,
  };
}

function SubmitRequestButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" variant="primary">
      {pending ? 'Enviando solicitação…' : 'Enviar solicitação'}
    </Button>
  );
}

export function PublicRequestForm({
  books,
  publicIdentifier,
  onCreated,
}: {
  books: readonly PublicBook[];
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
        ? 'Um ou mais livros não estão mais disponíveis. Revise a seleção e tente novamente.'
        : 'Não foi possível enviar a solicitação. Tente novamente.'
      : null;

  return (
    <>
      <div className="section-heading">
        <div>
          <h2 id="public-request-title">Solicitar empréstimo</h2>
          <p>Livros selecionados:</p>
          <ul>
            {books.map((book) => (
              <li key={book.id}>
                <strong>{book.title}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <form action={requestAction}>
        <input name="publicIdentifier" type="hidden" value={publicIdentifier} />
        {books.map((book) => (
          <input key={book.id} name="bookId" type="hidden" value={book.id} />
        ))}
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

export function BookRecommendations({
  recommendations,
  onToggle,
  selectedBookIds = [],
}: {
  recommendations: readonly BookRecommendation[];
  onToggle: (bookId: string) => void;
  selectedBookIds?: readonly string[];
}) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="public-recommendations-title"
      className="public-books"
    >
      <div className="section-heading">
        <h2 id="public-recommendations-title">Você também pode gostar</h2>
      </div>
      <div className="public-book-grid public-catalog-grid">
        {recommendations.map(({ book, reasons }) => (
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
              <CoverPlaceholder label={`Capa indisponível de ${book.title}`} />
            )}
            <h3>{book.title}</h3>
            <p>{book.author}</p>
            {reasons.map((reason) => (
              <p key={reason}>{reason}</p>
            ))}
            <Button
              aria-pressed={selectedBookIds.includes(book.id)}
              onClick={() => onToggle(book.id)}
              type="button"
              variant={
                selectedBookIds.includes(book.id) ? 'primary' : 'secondary'
              }
            >
              {selectedBookIds.includes(book.id)
                ? 'Remover da seleção'
                : 'Adicionar à seleção'}
            </Button>
          </article>
        ))}
      </div>
    </section>
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
  const [primaryBookId, setPrimaryBookId] = useState('');
  const [selectedBookIds, setSelectedBookIds] = useState<readonly string[]>([]);
  const [submittedRequestCount, setSubmittedRequestCount] = useState(0);
  const requestSectionRef = useRef<HTMLElement>(null);
  const filteredBooks = filterPublicBooks(books, search);
  const primaryBook = books.find((book) => book.id === primaryBookId);
  const selectedBooks = selectedBookIds.flatMap((bookId) => {
    const book = books.find((candidate) => candidate.id === bookId);
    return book ? [book] : [];
  });
  const recommendations = primaryBook ? recommendBooks(primaryBook, books) : [];

  function toggleBook(bookId: string) {
    setSubmittedRequestCount(0);
    setSelectedBookIds((currentIds) => {
      const nextSelection = updateBookSelection(
        currentIds,
        primaryBookId,
        bookId,
      );
      setPrimaryBookId(nextSelection.primaryBookId);
      return nextSelection.selectedBookIds;
    });
  }

  useEffect(() => {
    if (selectedBooks.length === 0) {
      return;
    }

    requestSectionRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'start',
    });
  }, [selectedBooks.length]);

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
                selectedBookIds.includes(book.id) ? 'selected' : ''
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
                aria-pressed={selectedBookIds.includes(book.id)}
                onClick={() => toggleBook(book.id)}
                type="button"
                variant={
                  selectedBookIds.includes(book.id) ? 'primary' : 'secondary'
                }
              >
                {selectedBookIds.includes(book.id) ? 'Remover' : 'Solicitar'}
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
      <BookRecommendations
        onToggle={toggleBook}
        recommendations={recommendations}
        selectedBookIds={selectedBookIds}
      />
      {selectedBooks.length > 0 && (
        <section
          aria-labelledby="public-request-title"
          className="public-request"
          ref={requestSectionRef}
        >
          <PublicRequestForm
            books={selectedBooks}
            onCreated={() => {
              setSubmittedRequestCount(selectedBooks.length);
              setPrimaryBookId('');
              setSelectedBookIds([]);
            }}
            publicIdentifier={publicIdentifier}
          />
        </section>
      )}
      {submittedRequestCount > 0 && (
        <p
          aria-live="polite"
          className="public-request-message public-request-success success"
          role="status"
        >
          {submittedRequestCount === 1
            ? 'Solicitação enviada com sucesso.'
            : 'Solicitações enviadas com sucesso.'}
        </p>
      )}
    </>
  );
}
