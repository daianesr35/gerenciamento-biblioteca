'use client';

import { useActionState } from 'react';

import {
  logoutAction,
  type LogoutActionState,
} from '@/app/(private)/logout-action';

const INITIAL_STATE: LogoutActionState = { status: 'idle' };

export function LogoutButton() {
  const [state, formAction, pending] = useActionState(
    logoutAction,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="logout-form">
      <button className="logout-button" disabled={pending} type="submit">
        {pending ? 'Saindo…' : 'Sair'}
      </button>
      {state.status === 'error' && (
        <p className="logout-error" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
