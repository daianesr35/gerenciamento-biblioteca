'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button, ButtonLink, Input } from '@/components/ui';
import type { CreateBookActionState } from '@/types/books';
import type {
  GoogleBooksBook,
  GoogleBooksLookupResult,
} from '@/types/google-books';

import { createBookAction, lookupGoogleBookAction } from './actions';

const INITIAL_STATE: CreateBookActionState = { status: 'idle' };

export type NewBookFormValues = GoogleBooksBook;

const INITIAL_VALUES: NewBookFormValues = {
  title: '',
  author: '',
  isbn: '',
  publisher: '',
  coverImageUrl: '',
};

export function mergeBookValues(
  current: NewBookFormValues,
  result: GoogleBooksLookupResult,
): NewBookFormValues {
  if (result.status !== 'success') {
    return current;
  }

  return {
    title: result.book.title || current.title,
    author: result.book.author || current.author,
    isbn: result.book.isbn || current.isbn,
    publisher: result.book.publisher || current.publisher,
    coverImageUrl: result.book.coverImageUrl || current.coverImageUrl,
  };
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" variant="primary">
      {pending ? 'Salvando…' : 'Salvar livro'}
    </Button>
  );
}

export function NewBookForm() {
  const [state, formAction] = useActionState(createBookAction, INITIAL_STATE);
  const [values, setValues] = useState(INITIAL_VALUES);
  const [lookupMessage, setLookupMessage] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const fieldErrors = state.status === 'invalid' ? state.fieldErrors : {};

  function updateField(field: keyof NewBookFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleLookup() {
    setIsLookingUp(true);
    setLookupMessage('');

    try {
      const result = await lookupGoogleBookAction(values.isbn);
      setValues((current) => mergeBookValues(current, result));
      setLookupMessage(
        result.status === 'success'
          ? 'Dados encontrados. Revise as informações antes de salvar.'
          : result.message,
      );
    } finally {
      setIsLookingUp(false);
    }
  }

  return (
    <form action={formAction} className="book-form-grid">
      <div className="isbn-lookup">
        <Input
          label="ISBN"
          name="isbn"
          onChange={(event) => updateField('isbn', event.target.value)}
          placeholder="Ex.: 9788535932786"
          value={values.isbn}
        />
        <Button
          disabled={isLookingUp}
          onClick={handleLookup}
          type="button"
          variant="primary"
        >
          {isLookingUp ? 'Buscando…' : 'Buscar ISBN'}
        </Button>
      </div>
      <Input
        error={fieldErrors.title}
        label="Título *"
        name="title"
        onChange={(event) => updateField('title', event.target.value)}
        placeholder="Título do livro"
        required
        value={values.title}
      />
      <Input
        error={fieldErrors.author}
        label="Autor *"
        name="author"
        onChange={(event) => updateField('author', event.target.value)}
        placeholder="Nome do autor"
        required
        value={values.author}
      />
      <Input
        label="Editora"
        name="publisher"
        onChange={(event) => updateField('publisher', event.target.value)}
        placeholder="Ex.: Companhia das Letras"
        value={values.publisher}
      />
      <Input
        error={fieldErrors.coverImageUrl}
        label="URL da capa"
        name="coverImageUrl"
        onChange={(event) => updateField('coverImageUrl', event.target.value)}
        placeholder="https://exemplo.com/capa.jpg"
        type="url"
        value={values.coverImageUrl}
      />

      {lookupMessage && (
        <p
          aria-live="polite"
          className="registration-message book-form-message"
          role="status"
        >
          {lookupMessage}
        </p>
      )}

      {state.status === 'error' && (
        <p
          aria-live="polite"
          className="registration-message error book-form-message"
          role="alert"
        >
          Não foi possível cadastrar o livro. Tente novamente.
        </p>
      )}

      <div className="new-book-actions book-form-actions">
        <ButtonLink href="/biblioteca">Cancelar</ButtonLink>
        <SubmitButton />
      </div>
    </form>
  );
}
