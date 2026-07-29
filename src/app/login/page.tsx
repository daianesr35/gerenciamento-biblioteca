'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';

import { Button, Input } from '@/components/ui';
import type { LoginActionState } from '@/types/auth';

import { loginAction } from './actions';

const INITIAL_STATE: LoginActionState = { status: 'idle' };

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

function FieldIcon({ type }: { type: 'email' | 'password' }) {
  return type === 'email' ? (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <rect height="15" rx="2" width="19" x="2.5" y="4.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  ) : (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <rect height="11" rx="2" width="15" x="4.5" y="10" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
    </svg>
  );
}

function BenefitIcon({ type }: { type: 'loans' | 'security' }) {
  return type === 'loans' ? (
    <svg aria-hidden="true" fill="none" viewBox="0 0 32 32">
      <circle cx="11" cy="10" r="4" />
      <circle cx="23" cy="12" r="3" />
      <path d="M3 26c0-5 3-8 8-8s8 3 8 8M19 20c1-.8 2.3-1 4-1 4 0 6 2.5 6 6" />
    </svg>
  ) : (
    <svg aria-hidden="true" fill="none" viewBox="0 0 32 32">
      <path d="M16 3 27 7v7c0 7-4.5 12-11 15C9.5 26 5 21 5 14V7l11-4Z" />
      <path d="m11 16 3 3 7-7" />
    </svg>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" variant="primary">
      <FieldIcon type="password" />
      {pending ? 'Entrando…' : 'Entrar'}
    </Button>
  );
}

function loginMessage(state: LoginActionState): string | null {
  if (state.status === 'invalid') {
    const emailRequired = state.fieldErrors.email === 'Informe seu e-mail.';
    const passwordRequired =
      state.fieldErrors.password === 'Informe sua senha.';

    if (emailRequired && passwordRequired) {
      return 'E-mail e senha são obrigatórios.';
    }

    return state.fieldErrors.email ?? state.fieldErrors.password ?? null;
  }

  if (state.status === 'error') {
    return state.category === 'invalid_credentials'
      ? 'E-mail ou senha inválidos.'
      : 'Não foi possível entrar. Tente novamente.';
  }

  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction] = useActionState(loginAction, INITIAL_STATE);
  const message = loginMessage(state);
  const fieldErrors = state.status === 'invalid' ? state.fieldErrors : {};

  useEffect(() => {
    if (state.status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [router, state.status]);

  return (
    <main className="login-page">
      <section className="photo-panel" aria-label="Fotografia da biblioteca">
        <div className="photo-copy">
          <h1>
            Sua biblioteca,
            <br />
            <span>sempre com você.</span>
          </h1>
          <p>
            Organize seus livros, controle empréstimos e compartilhe sua coleção
            de forma simples e segura.
          </p>
          <ul className="login-benefits" aria-label="Benefícios">
            <li>
              <BookIcon />
              <span>Organize sua coleção</span>
            </li>
            <li>
              <BenefitIcon type="loans" />
              <span>Controle empréstimos</span>
            </li>
            <li>
              <BenefitIcon type="security" />
              <span>Acesso seguro e privado</span>
            </li>
          </ul>
        </div>
      </section>
      <section className="login-panel" aria-labelledby="login-title">
        <form action={formAction} className="login-form">
          <div className="login-brand">
            <BookIcon />
            <h1 id="login-title">Minha Biblioteca</h1>
            <p className="subtitle">Acesse sua biblioteca pessoal</p>
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
              autoComplete="current-password"
              error={fieldErrors.password}
              label="Senha"
              name="password"
              placeholder="Sua senha"
              required
              type="password"
            />
          </div>
          {message && (
            <p
              aria-live="polite"
              className="registration-message error"
              role="alert"
            >
              {message}
            </p>
          )}
          <SubmitButton />
        </form>
      </section>
    </main>
  );
}
