import Link from 'next/link';

import { BookCard } from '@/components/book-card';
import { ButtonLink, Card, StatCard } from '@/components/ui';
import { books } from '@/data/mock/library';

function DashboardStatIcon({
  type,
}: {
  type: 'books' | 'available' | 'loans' | 'requests';
}) {
  const paths = {
    books: (
      <>
        <path d="M12 7H7a3 3 0 0 0-3 3v15a3 3 0 0 1 3-3h5a6 6 0 0 1 5 3V10a6 6 0 0 0-5-3Z" />
        <path d="M22 7h5a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3h-5a6 6 0 0 0-5 3" />
      </>
    ),
    available: (
      <>
        <rect height="24" rx="2" width="18" x="7" y="5" />
        <path d="m12 17 3 3 6-7M28 9v18" />
      </>
    ),
    loans: (
      <>
        <circle cx="12" cy="11" r="4" />
        <circle cx="23" cy="13" r="3" />
        <path d="M4 28c0-6 3-9 8-9s8 3 8 9M20 21c1-.7 2-1 4-1 4 0 6 3 6 7" />
      </>
    ),
    requests: (
      <>
        <rect height="24" rx="2" width="18" x="7" y="5" />
        <path d="M12 11h8M12 16h8M12 21h5" />
      </>
    ),
  } as const;

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 34 34">
      {paths[type]}
    </svg>
  );
}

export default function DashboardPage() {
  return (
    <div className="dashboard-page">
      <section className="hero dashboard-hero" aria-labelledby="welcome-title">
        <h1 id="welcome-title">Bem-vinda de volta, Daiane! 👋</h1>
        <p>Sua biblioteca pessoal organizada e sempre à mão.</p>
        <ButtonLink href="/livros/novo">＋ Adicionar livro</ButtonLink>
      </section>

      <section className="dashboard-section" aria-labelledby="resumo-title">
        <div className="section-heading">
          <h2 id="resumo-title">Resumo da biblioteca</h2>
          <Link className="dashboard-text-link" href="/biblioteca">
            Ver tudo
          </Link>
        </div>
        <div className="stats-grid">
          <StatCard
            icon={<DashboardStatIcon type="books" />}
            label="Total de livros"
            value="266"
          />
          <StatCard
            icon={<DashboardStatIcon type="available" />}
            label="Disponíveis"
            value="198"
          />
          <StatCard
            icon={<DashboardStatIcon type="loans" />}
            label="Emprestados"
            value="28"
          />
          <StatCard
            icon={<DashboardStatIcon type="requests" />}
            label="Solicitações"
            value="5"
          />
        </div>
      </section>

      <section
        className="dashboard-section dashboard-recent"
        aria-labelledby="recentes-title"
      >
        <div className="section-heading">
          <h2 id="recentes-title">Livros recentes</h2>
          <Link className="dashboard-text-link" href="/biblioteca">
            Ver tudo
          </Link>
        </div>
        <div className="book-grid">
          {books.slice(0, 6).map((book) => (
            <BookCard book={book} key={book.id} />
          ))}
        </div>
      </section>

      <div className="dashboard-bottom dashboard-section">
        <Card className="dashboard-list-card">
          <div className="section-heading">
            <h2>Empréstimos ativos</h2>
            <Link className="dashboard-text-link" href="/emprestimos">
              Ver todos
            </Link>
          </div>
          <ul className="compact-list dashboard-loans">
            <li>
              <span aria-hidden="true" className="dashboard-avatar">
                JS
              </span>
              <span>
                <strong>José Silva</strong>
                <small>O Hobbit · Devolução: 25/06/2026</small>
              </span>
            </li>
            <li>
              <span aria-hidden="true" className="dashboard-avatar">
                MO
              </span>
              <span>
                <strong>Maria Oliveira</strong>
                <small>1984 · Devolução: 27/06/2026</small>
              </span>
            </li>
          </ul>
        </Card>
        <Card className="dashboard-list-card">
          <div className="section-heading">
            <h2>Categorias principais</h2>
            <Link className="dashboard-text-link" href="/biblioteca">
              Ver todas
            </Link>
          </div>
          <ul className="compact-list dashboard-categories">
            <li>
              <strong>Ficção</strong>
              <span aria-hidden="true" className="category-bar">
                <i style={{ width: '82%' }} />
              </span>
              <span className="muted">82 livros</span>
            </li>
            <li>
              <strong>História</strong>
              <span aria-hidden="true" className="category-bar">
                <i style={{ width: '47%' }} />
              </span>
              <span className="muted">47 livros</span>
            </li>
            <li>
              <strong>Fantasia</strong>
              <span aria-hidden="true" className="category-bar">
                <i style={{ width: '31%' }} />
              </span>
              <span className="muted">31 livros</span>
            </li>
          </ul>
        </Card>
        <Card className="dashboard-quote">
          <blockquote>
            <span aria-hidden="true">“</span>
            <p>Ler é participar.</p>
            <cite>— José Saramago</cite>
          </blockquote>
        </Card>
      </div>
    </div>
  );
}
