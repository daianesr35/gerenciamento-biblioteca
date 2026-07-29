import { RegistrationForm } from './registration-form';

export default function RegistrationPage() {
  return (
    <main className="login-page">
      <section className="photo-panel" aria-label="Fotografia da biblioteca">
        <div className="photo-copy">
          <h1>
            Sua biblioteca,
            <br />
            <span>do seu jeito.</span>
          </h1>
          <p>
            Crie sua conta para organizar seus livros e cuidar da sua coleção em
            um só lugar.
          </p>
        </div>
      </section>
      <section className="login-panel" aria-labelledby="registration-title">
        <RegistrationForm />
      </section>
    </main>
  );
}
