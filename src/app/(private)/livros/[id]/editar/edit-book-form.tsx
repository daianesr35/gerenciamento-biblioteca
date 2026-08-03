'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button, ButtonLink, Input } from '@/components/ui';
import type { Book, UpdateBookActionState } from '@/types/books';

import { updateBookAction } from './actions';

const INITIAL_STATE: UpdateBookActionState = { status: 'idle' };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" variant="primary">
      {pending ? 'Salvando…' : 'Salvar alterações'}
    </Button>
  );
}

export function EditBookForm({ book }: { book: Book }) {
  const action = updateBookAction.bind(null, book.id);
  const [state, formAction] = useActionState(action, INITIAL_STATE);
  const fieldErrors = state.status === 'invalid' ? state.fieldErrors : {};

  return (
    <form action={formAction} className="book-form-grid">
      <Input
        defaultValue={book.title}
        error={fieldErrors.title}
        label="Título *"
        name="title"
        required
      />
      <Input
        defaultValue={book.author}
        error={fieldErrors.author}
        label="Autor *"
        name="author"
        required
      />
      <Input defaultValue={book.isbn ?? ''} label="ISBN" name="isbn" />
      <Input
        defaultValue={book.publisher ?? ''}
        label="Editora"
        name="publisher"
      />
      <Input
        defaultValue={book.category ?? ''}
        label="Categoria"
        name="category"
      />
      <Input
        defaultValue={book.coverImageUrl ?? ''}
        error={fieldErrors.coverImageUrl}
        label="URL da capa"
        name="coverImageUrl"
        type="url"
      />

      {(state.status === 'not_found' || state.status === 'invalid_id') && (
        <p
          aria-live="polite"
          className="registration-message error book-form-message"
          role="alert"
        >
          Não foi possível atualizar o livro.
        </p>
      )}
      {state.status === 'error' && (
        <p
          aria-live="polite"
          className="registration-message error book-form-message"
          role="alert"
        >
          Não foi possível salvar as alterações. Tente novamente.
        </p>
      )}

      <div className="new-book-actions book-form-actions">
        <ButtonLink href={`/livros/${book.id}`}>Cancelar</ButtonLink>
        <SubmitButton />
      </div>
    </form>
  );
}
