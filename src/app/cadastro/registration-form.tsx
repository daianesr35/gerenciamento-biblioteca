'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';

import { Button, Input } from '@/components/ui';
import { MINIMUM_PASSWORD_LENGTH } from '@/services/auth';
import type { RegistrationActionState } from '@/types/auth';

import { registerAction } from './actions';

const INITIAL_STATE: RegistrationActionState = { status: 'idle' };

function FieldIcon({ type }: { type: 'name' | 'email' | 'password' }) {
  if (type === 'name') {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-5 3-8 8-8s8 3 8 8" />
      </svg>
    );
  }

  if (type === 'email') {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <rect height="15" rx="2" width="19" x="2.5" y="4.5" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <rect height="11" rx="2" width="15" x="4.5" y="10" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
    </svg>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" variant="primary">
      {pending ? 'Criando conta…' : 'Criar conta'}
    </Button>
  );
}

function registrationMessage(state: RegistrationActionState): string | null {
  if (state.status === 'confirmation_required') {
    return 'Conta criada. Confirme seu e-mail antes de entrar.';
  }

  if (state.status === 'invalid') {
    return 'Verifique os dados informados.';
  }

  if (state.status === 'error') {
    return state.category === 'unavailable'
      ? 'Ocorreu um erro ao criar a conta. Tente novamente.'
      : 'Não foi possível criar a conta. Verifique os dados ou tente novamente.';
  }

  return null;
}

export function RegistrationForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(registerAction, INITIAL_STATE);
  const message = registrationMessage(state);
  const fieldErrors = state.status === 'invalid' ? state.fieldErrors : {};

  useEffect(() => {
    if (state.status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [router, state.status]);

  return (
    <form action={formAction} className="login-form registration-form">
      <div className="login-brand">
        <BookIcon />
        <h1 id="registration-title">Criar conta</h1>
        <p className="subtitle">Comece sua biblioteca pessoal</p>
      </div>

      <div className="login-field">
        <FieldIcon type="name" />
        <Input
          autoComplete="name"
          error={fieldErrors.name}
          label="Nome"
          name="name"
          placeholder="Seu nome"
          required
        />
      </div>

      <div className="login-field">
        <FieldIcon type="email" />
        <Input
          autoComplete="email"
          error={fieldErrors.email}
          label="E-mail"
          name="email"
          placeholder="seu@email.com"
          required
          type="email"
        />
      </div>

      <div className="login-field">
        <FieldIcon type="password" />
        <Input
          autoComplete="new-password"
          error={fieldErrors.password}
          label="Senha"
          minLength={MINIMUM_PASSWORD_LENGTH}
          name="password"
          placeholder="Crie uma senha"
          required
          type="password"
        />
      </div>

      {message && (
        <p
          aria-live="polite"
          className={`registration-message ${
            state.status === 'confirmation_required' ? 'success' : 'error'
          }`}
          role={state.status === 'confirmation_required' ? 'status' : 'alert'}
        >
          {message}
        </p>
      )}

      <SubmitButton />
      <p className="registration-login-link">
        Já tem uma conta? <Link href="/login">Voltar ao Login</Link>
      </p>
    </form>
  );
}

function BookIcon() {
  return (
    <svg
      aria-hidden="true"
      className="login-book-icon"
      fill="none"
      viewBox="0 0 64 54"
    >
      <path d="M32 12c-6-7-15-8-24-6v37c9-2 18-1 24 6m0-37c6-7 15-8 24-6v37c-9-2-18-1-24 6m0-37v37M8 12H4v38c10-2 20-1 28 3 8-4 18-5 28-3V12h-4" />
    </svg>
  );
}
