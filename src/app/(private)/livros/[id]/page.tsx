import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CoverPlaceholder,
} from '@/components/ui';
import { books } from '@/data/mock/library';

type DetailIcon =
  | 'activity-loan'
  | 'activity-register'
  | 'activity-returned'
  | 'arrow'
  | 'book'
  | 'calendar'
  | 'category'
  | 'delete'
  | 'edit'
  | 'info'
  | 'isbn'
  | 'language'
  | 'more'
  | 'pages'
  | 'person'
  | 'request'
  | 'return';

function Icon({ type }: { type: DetailIcon }) {
  const paths: Record<DetailIcon, ReactNode> = {
    'activity-loan': (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 20c0-4.5 1.8-7 5.5-7 2.8 0 4.5 1.4 5.2 4" />
        <path d="m15 10 2-2 2 2M17 8v7M14 15h6" />
      </>
    ),
    'activity-register': (
      <>
        <path d="M11 5H6a3 3 0 0 0-3 3v11a3 3 0 0 1 3-3h5a5 5 0 0 1 4 2V8a5 5 0 0 0-4-3Z" />
        <path d="M19 5h-3v13a5 5 0 0 1 4-2h1V7a2 2 0 0 0-2-2Z" />
        <path d="M8 9v4M6 11h4" />
      </>
    ),
    'activity-returned': (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 20c0-4.5 1.8-7 5.5-7 2.6 0 4.2 1.2 5 3.5" />
        <path d="m14 11 3 3 4-5" />
      </>
    ),
    arrow: <path d="m15 18-6-6 6-6M9 12h12" />,
    book: (
      <>
        <path d="M11 5H6a3 3 0 0 0-3 3v12a3 3 0 0 1 3-3h5a5 5 0 0 1 4 2V8a5 5 0 0 0-4-3Z" />
        <path d="M19 5h-3v14a5 5 0 0 1 4-2h1V7a2 2 0 0 0-2-2Z" />
      </>
    ),
    calendar: (
      <>
        <rect height="17" rx="2" width="18" x="3" y="4" />
        <path d="M7 2v4M17 2v4M3 9h18M8 13h3v3H8z" />
      </>
    ),
    category: (
      <>
        <path d="M20 13 11 22l-9-9V4h9l9 9Z" />
        <circle cx="7" cy="9" r="1" />
      </>
    ),
    delete: (
      <>
        <path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14" />
        <path d="M10 11v6M14 11v6" />
      </>
    ),
    edit: (
      <>
        <path d="m4 20 4-1 11-11a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" />
        <path d="m14 7 3 3" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7h.01" />
      </>
    ),
    isbn: <path d="M4 4v16M8 4v16M12 4v16M16 4v16M20 4v16" />,
    language: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c3 3 4 6 4 9s-1 6-4 9c-3-3-4-6-4-9s1-6 4-9Z" />
      </>
    ),
    more: (
      <>
        <circle cx="6" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="18" cy="12" r="1" />
      </>
    ),
    pages: (
      <>
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M15 3v5h4M9 12h7M9 16h5" />
      </>
    ),
    person: (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 21c0-5 2-8 7-8s7 3 7 8" />
      </>
    ),
    request: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 21c0-5 2-8 6-8s6 3 6 8M17 7v6M14 10h6" />
      </>
    ),
    return: (
      <>
        <path d="M20 7v5a7 7 0 0 1-7 7H5" />
        <path d="m8 16-3 3 3 3M4 5h8v8H4z" />
      </>
    ),
  };
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
}

function MetaItem({
  icon,
  label,
  children,
}: {
  icon: DetailIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="book-detail-meta-item">
      <span className="book-detail-icon">
        <Icon type={icon} />
      </span>
      <div>
        <dt>{label}</dt>
        <dd>{children}</dd>
      </div>
    </div>
  );
}

export default async function BookDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = books.find((item) => item.id === id);
  if (!book) notFound();
  const available = book.status === 'Disponível';

  return (
    <div className="book-detail-page">
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link href="/biblioteca">Livros</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Detalhes do livro</span>
      </nav>
      <header className="book-detail-heading">
        <div>
          <h1>Detalhes do livro</h1>
          <p>Visualize todas as informações do livro.</p>
        </div>
        <div className="book-detail-heading-actions">
          <ButtonLink href="/biblioteca">
            <Icon type="arrow" />
            Voltar para a biblioteca
          </ButtonLink>
          <ButtonLink href={`/livros/${book.id}/editar`}>
            <Icon type="edit" />
            Editar
          </ButtonLink>
          <Button variant="danger">
            <Icon type="delete" />
            Excluir
          </Button>
        </div>
      </header>

      <div className="book-detail-layout">
        <div className="book-detail-main">
          <Card className="book-detail-summary">
            <div className="book-detail-cover">
              <CoverPlaceholder label={`Capa indisponível de ${book.title}`} />
              <Badge tone={available ? 'success' : 'warning'}>
                {book.status}
              </Badge>
            </div>
            <div className="book-detail-copy">
              <h2>{book.title}</h2>
              <p className="book-detail-edition">A Sociedade do Anel</p>
              <p className="book-detail-author">
                <Icon type="person" />
                {book.author}
              </p>
              <dl className="book-detail-meta">
                <MetaItem icon="book" label="Editora">
                  HarperCollins Brasil
                </MetaItem>
                <MetaItem icon="language" label="Idioma">
                  Português
                </MetaItem>
                <MetaItem icon="calendar" label="Ano de publicação">
                  1954
                </MetaItem>
                <MetaItem icon="isbn" label="ISBN">
                  978-85-365-0261-8
                </MetaItem>
                <MetaItem icon="pages" label="Páginas">
                  423
                </MetaItem>
                <MetaItem icon="category" label="Categoria">
                  <Badge>{book.category}</Badge>
                </MetaItem>
              </dl>
            </div>
            <div className="book-detail-actions">
              <Button>
                <Icon type="person" />
                Emprestar
              </Button>
              <Button>
                <Icon type="request" />
                Solicitar empréstimo
              </Button>
              <Button>
                <Icon type="return" />
                Devolver livro
              </Button>
              <Button aria-label="Mais ações" className="detail-more-button">
                <Icon type="more" />
              </Button>
            </div>
          </Card>

          <Card className="book-detail-description">
            <section aria-labelledby="description-title">
              <h2 id="description-title">Descrição</h2>
              <p>
                A Sociedade do Anel é o primeiro volume da trilogia épica O
                Senhor dos Anéis. Frodo Bolseiro herda um anel mágico que
                pertenceu ao Senhor do Escuro Sauron. Para destruir o anel e
                impedir que Sauron recupere seu poder, Frodo inicia uma jornada
                perigosa ao lado de seus amigos, formando a Sociedade do Anel.
              </p>
            </section>
            <section aria-labelledby="keywords-title">
              <h3 id="keywords-title">Palavras-chave / Etiquetas</h3>
              <div className="book-detail-tags">
                {[
                  'fantasia',
                  'aventura',
                  'épico',
                  'magia',
                  'jornada',
                  'amizade',
                ].map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
                <Button
                  aria-label="Adicionar etiqueta"
                  className="detail-add-chip"
                >
                  +
                </Button>
              </div>
            </section>
            <section aria-labelledby="categories-title">
              <h3 id="categories-title">Categorias</h3>
              <div className="book-detail-tags">
                <Badge>{book.category}</Badge>
                <Button className="detail-text-action">
                  + Adicionar categoria
                </Button>
              </div>
            </section>
            <section aria-labelledby="notes-title">
              <h3 id="notes-title">Notas pessoais</h3>
              <div className="book-detail-note">
                <p>Um dos meus livros favoritos!</p>
                <Button>
                  <Icon type="edit" />
                  Editar nota
                </Button>
              </div>
            </section>
          </Card>
        </div>

        <aside
          aria-label="Informações complementares"
          className="book-detail-side"
        >
          <Card className="book-detail-status-card">
            <h2>Status do livro</h2>
            <div
              className={`book-detail-status ${available ? 'success' : 'warning'}`}
            >
              <span className="book-detail-status-icon">
                <Icon type="book" />
              </span>
              <div>
                <strong>{book.status}</strong>
                <p>
                  {available
                    ? 'Este livro está disponível para empréstimo.'
                    : 'Este livro está emprestado no momento.'}
                </p>
              </div>
            </div>
            <dl className="book-detail-facts">
              <div>
                <dt>
                  <Icon type="calendar" /> Adicionado em
                </dt>
                <dd>15/03/2026</dd>
              </div>
            </dl>
            <div className="book-detail-notice">
              <Icon type="info" />
              <p>
                A capa seria obtida automaticamente pela API Google Books.
                <br />
                Não é possível alterar a imagem manualmente.
              </p>
            </div>
          </Card>

          <Card className="book-detail-copy-card">
            <div className="book-detail-card-title">
              <h2>Exemplares (1)</h2>
              <span aria-label="Informação sobre exemplares">
                <Icon type="info" />
              </span>
            </div>
            <div className="book-detail-copy-data">
              <div className="book-detail-copy-heading">
                <strong>Exemplar #1</strong>
                <Badge tone={available ? 'success' : 'warning'}>
                  {book.status}
                </Badge>
              </div>
              <dl>
                <div>
                  <dt>Condição</dt>
                  <dd>Ótimo</dd>
                </div>
                <div>
                  <dt>Adicionado em</dt>
                  <dd>15/03/2026</dd>
                </div>
                <div>
                  <dt>Código de barras</dt>
                  <dd>1000001234567</dd>
                </div>
              </dl>
            </div>
          </Card>

          <Card className="book-detail-activity-card">
            <h2>Atividades recentes</h2>
            <ol className="book-detail-activity-list">
              <li>
                <span className="activity-icon success">
                  <Icon type="activity-register" />
                </span>
                <div>
                  <strong>Livro cadastrado</strong>
                  <span>15/03/2026 às 14:32</span>
                </div>
                <span className="activity-owner">Daiane Ribeiro</span>
              </li>
              <li>
                <span className="activity-icon warning">
                  <Icon type="activity-returned" />
                </span>
                <div>
                  <strong>Emprestado para José Silva</strong>
                  <span>
                    05/05/2026 às 10:15
                    <br />
                    Devolvido em 25/05/2026
                  </span>
                </div>
                <span className="activity-owner">Daiane Ribeiro</span>
              </li>
              <li>
                <span className="activity-icon info">
                  <Icon type="activity-loan" />
                </span>
                <div>
                  <strong>Emprestado para Maria Oliveira</strong>
                  <span>
                    10/06/2026 às 16:40
                    <br />
                    Em andamento
                  </span>
                </div>
                <span className="activity-owner">Daiane Ribeiro</span>
              </li>
            </ol>
            <Button className="book-detail-all-activity">
              Ver todas as atividades
            </Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}
