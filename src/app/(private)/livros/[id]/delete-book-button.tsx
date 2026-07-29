'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui';
import type { DeleteBookActionState } from '@/types/books';

import { deleteBookAction } from './actions';

const INITIAL_STATE: DeleteBookActionState = { status: 'idle' };

function ConfirmButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" variant="danger">
      {pending ? 'Excluindo…' : 'Confirmar exclusão'}
    </Button>
  );
}

export function DeleteBookButton({ bookId }: { bookId: string }) {
  const [confirming, setConfirming] = useState(false);
  const confirmationRef = useRef<HTMLFormElement>(null);
  const action = deleteBookAction.bind(null, bookId);
  const [state, formAction] = useActionState(action, INITIAL_STATE);

  useEffect(() => {
    if (confirming) {
      confirmationRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [confirming]);

  if (!confirming) {
    return (
      <div className="delete-book-control">
        <Button
          className="delete-book-trigger"
          onClick={() => setConfirming(true)}
          type="button"
          variant="danger"
        >
          Excluir livro
        </Button>
      </div>
    );
  }

  return (
    <form
      ref={confirmationRef}
      action={formAction}
      className="delete-book-confirmation"
    >
      <div className="delete-book-warning">
        <span aria-hidden="true" className="delete-book-warning-icon">
          !
        </span>
        <div>
          <strong>Excluir este livro permanentemente?</strong>
          <p>
            Esta ação não poderá ser desfeita. Confirme somente se deseja
            remover o livro da biblioteca.
          </p>
        </div>
      </div>
      {state.status === 'error' && (
        <p
          aria-live="polite"
          className="registration-message error delete-book-error"
          role="alert"
        >
          {state.message}
        </p>
      )}
      <div className="delete-book-actions">
        <Button onClick={() => setConfirming(false)} type="button">
          Cancelar
        </Button>
        <ConfirmButton />
      </div>
    </form>
  );
}
