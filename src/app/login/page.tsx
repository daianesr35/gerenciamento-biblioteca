'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button, Input } from '@/components/ui';

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

export default function LoginPage() {
  const router = useRouter();
  const [errors, setErrors] = useState({ email: false, password: false });

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
        <form
          className="login-form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const email = form.elements.namedItem('email') as HTMLInputElement;
            const password = form.elements.namedItem(
              'password',
            ) as HTMLInputElement;
            const nextErrors = {
              email: !email.validity.valid,
              password: !password.validity.valid,
            };

            setErrors(nextErrors);
            if (!nextErrors.email && !nextErrors.password) {
              router.push('/dashboard');
            }
          }}
        >
          <div className="login-brand">
            <BookIcon />
            <h1 id="login-title">Minha Biblioteca</h1>
            <p className="subtitle">Acesse sua biblioteca pessoal</p>
          </div>
          <div className="login-field">
            <FieldIcon type="email" />
            <Input
              error={errors.email ? 'Informe um e-mail válido.' : undefined}
              label="E-mail"
              name="email"
              onChange={() =>
                errors.email &&
                setErrors((current) => ({ ...current, email: false }))
              }
              placeholder="seu@email.com"
              required
              type="email"
            />
          </div>
          <div className="login-field">
            <FieldIcon type="password" />
            <Input
              error={errors.password ? 'Informe sua senha.' : undefined}
              label="Senha"
              minLength={1}
              name="password"
              onChange={() =>
                errors.password &&
                setErrors((current) => ({ ...current, password: false }))
              }
              placeholder="Sua senha"
              required
              type="password"
            />
          </div>
          <p className="forgot-password">
            <a className="muted" href="#recuperacao-indisponivel">
              Esqueceu sua senha?
            </a>
          </p>
          <Button type="submit" variant="primary">
            <FieldIcon type="password" />
            Entrar
          </Button>
          <p className="sr-only" id="recuperacao-indisponivel">
            A recuperação de senha estará disponível em uma etapa posterior.
          </p>
        </form>
      </section>
    </main>
  );
}
