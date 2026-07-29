'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button, ButtonLink, Input } from '@/components/ui';
import type { CreateBookActionState } from '@/types/books';

import { createBookAction } from './actions';

const INITIAL_STATE: CreateBookActionState = { status: 'idle' };

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
  const fieldErrors = state.status === 'invalid' ? state.fieldErrors : {};

  return (
    <form action={formAction} className="book-form-grid">
      <Input
        error={fieldErrors.title}
        label="Título *"
        name="title"
        placeholder="Título do livro"
        required
      />
      <Input
        error={fieldErrors.author}
        label="Autor *"
        name="author"
        placeholder="Nome do autor"
        required
      />
      <Input label="ISBN" name="isbn" placeholder="Ex.: 9788535932786" />
      <Input
        label="Editora"
        name="publisher"
        placeholder="Ex.: Companhia das Letras"
      />
      <Input
        error={fieldErrors.coverImageUrl}
        label="URL da capa"
        name="coverImageUrl"
        placeholder="https://exemplo.com/capa.jpg"
        type="url"
      />

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
