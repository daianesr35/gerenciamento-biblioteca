'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';

import { Button } from '@/components/ui';
import { books } from '@/data/mock/library';

type PublicIcon = 'book' | 'copy' | 'download' | 'info' | 'share' | 'users';

function Icon({ name }: { name: PublicIcon }) {
  const paths: Record<PublicIcon, ReactNode> = {
    book: (
      <>
        <path d="M12 6c-2.6-2.2-5.7-2.6-9-1.5v13c3.3-1.1 6.4-.7 9 1.5m0-13c2.6-2.2 5.7-2.6 9-1.5v13c-3.3-1.1-6.4-.7-9 1.5m0-13v13" />
      </>
    ),
    copy: (
      <>
        <rect height="14" rx="2" width="12" x="8" y="7" />
        <path d="M16 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h2" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-4-4 4 4 4-4M5 20h14" />
      </>
    ),
    info: (
      <>
        <path d="M9 21h6M10 17h4" />
        <path d="M8.5 14.5A7 7 0 1 1 15.5 14.5c-1 1-1.5 1.8-1.5 2.5h-4c0-.7-.5-1.5-1.5-2.5Z" />
      </>
    ),
    share: (
      <>
        <circle cx="6" cy="12" r="2.5" />
        <circle cx="18" cy="6" r="2.5" />
        <circle cx="18" cy="18" r="2.5" />
        <path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="10" r="2.5" />
        <path d="M3 21c0-5 2-8 6-8s6 3 6 8M15 15c1-.7 2-1 3-1 3 0 5 2 5 6" />
      </>
    ),
  };

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

const categoryTone: Record<string, string> = {
  Fantasia: 'green',
  Ficção: 'red',
  História: 'purple',
  'Literatura brasileira': 'orange',
};

export default function PublicPagePreview() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Todos');
  const [category, setCategory] = useState('Todas');
  const categories = [...new Set(books.map((book) => book.category))];
  const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');
  const publicBooks = books.filter((book) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      book.title.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
      book.author.toLocaleLowerCase('pt-BR').includes(normalizedSearch);
    const matchesStatus = status === 'Todos' || book.status === status;
    const matchesCategory = category === 'Todas' || book.category === category;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="public-page">
      <header className="public-page-heading">
        <div>
          <h1>Página Pública</h1>
          <p>
            Compartilhe sua biblioteca com outras pessoas e permita que
            solicitem empréstimos.
          </p>
        </div>
      </header>

      <nav aria-label="Seções da Página Pública" className="public-tabs">
        <button aria-current="page" className="active" type="button">
          <Icon name="book" />
          Visão da página
        </button>
        <button type="button">
          <Icon name="info" />
          Personalização
        </button>
        <button type="button">
          <Icon name="share" />
          Compartilhamento
        </button>
      </nav>

      <div className="public-layout">
        <div className="public-main">
          <section
            className="public-library-card"
            aria-labelledby="library-name"
          >
            <div className="public-banner">
              <span aria-hidden="true" className="public-library-mark">
                <Icon name="book" />
              </span>
              <div>
                <h2 id="library-name">Biblioteca de Daiane</h2>
                <p>Livros que contam histórias e conectam pessoas.</p>
              </div>
            </div>
            <div className="public-catalog-tools">
              <div className="public-book-search">
                <label className="sr-only" htmlFor="public-book-search">
                  Pesquisar livro
                </label>
                <input
                  id="public-book-search"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Pesquisar livros..."
                  type="search"
                  value={search}
                />
              </div>
              <div className="public-status-filter">
                <label htmlFor="public-book-status">Status</label>
                <select
                  id="public-book-status"
                  onChange={(event) => setStatus(event.target.value)}
                  value={status}
                >
                  <option>Todos</option>
                  <option>Disponível</option>
                  <option>Emprestado</option>
                </select>
              </div>
              <div className="public-status-filter">
                <label htmlFor="public-book-category">Categoria</label>
                <select
                  id="public-book-category"
                  onChange={(event) => setCategory(event.target.value)}
                  value={category}
                >
                  <option>Todas</option>
                  {categories.map((bookCategory) => (
                    <option key={bookCategory}>{bookCategory}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section
            className="public-books"
            aria-labelledby="public-books-title"
          >
            <div className="section-heading">
              <h2 id="public-books-title">Livros em destaque</h2>
              <Link href="/biblioteca">
                Ver todos os livros <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="public-book-grid">
              {publicBooks.map((book) => (
                <article className="public-book" key={book.id}>
                  <div
                    aria-label={`Capa de ${book.title}`}
                    className="public-cover"
                    role="img"
                  >
                    <span>{book.title}</span>
                  </div>
                  <h3>{book.title}</h3>
                  <p>{book.author}</p>
                  <span
                    className={`public-category ${categoryTone[book.category] ?? 'blue'}`}
                  >
                    {book.category}
                  </span>
                </article>
              ))}
            </div>
            {publicBooks.length === 0 && (
              <p className="public-books-empty" role="status">
                Nenhum livro encontrado para os filtros selecionados.
              </p>
            )}
          </section>

          <section
            className="public-how-it-works"
            aria-labelledby="visitor-help"
          >
            <span aria-hidden="true">
              <Icon name="users" />
            </span>
            <div>
              <h2 id="visitor-help">Como funciona para quem visita</h2>
              <p>
                As pessoas podem visualizar seus livros e enviar solicitações de
                empréstimo.
              </p>
              <p>
                Você receberá as solicitações aqui no sistema e poderá aprovar
                ou recusar.
              </p>
            </div>
          </section>
        </div>

        <aside className="public-aside" aria-label="Compartilhamento da página">
          <section className="public-side-card">
            <h2>Compartilhe sua página</h2>
            <p>
              Qualquer pessoa com o link abaixo pode visualizar sua biblioteca.
            </p>
            <div className="public-link">
              <label className="sr-only" htmlFor="public-link">
                Link público
              </label>
              <input
                id="public-link"
                readOnly
                value="https://minhabiblioteca.com/daiane"
              />
              <button aria-label="Copiar link público" type="button">
                <Icon name="copy" />
              </button>
            </div>
          </section>

          <section className="public-side-card public-qr-card">
            <h2>QR Code</h2>
            <p>Escaneie para acessar sua página pública.</p>
            <div
              aria-label="Representação simulada do QR Code da página pública"
              className="public-qr"
              role="img"
            />
            <Button>
              <Icon name="download" />
              Baixar QR Code
            </Button>
          </section>

          <section className="public-side-card">
            <h2>Configurações da página pública</h2>
            <div className="public-setting">
              <div>
                <strong>Página pública</strong>
                <span>Permitir que qualquer pessoa visualize</span>
              </div>
              <button
                aria-label="Página pública ativada"
                aria-pressed="true"
                className="public-switch"
                type="button"
              >
                <span />
              </button>
            </div>
            <div className="public-setting">
              <div>
                <strong>Solicitações de empréstimo</strong>
                <span>Permitir que visitantes enviem solicitações</span>
              </div>
              <button
                aria-label="Solicitações de empréstimo ativadas"
                aria-pressed="true"
                className="public-switch"
                type="button"
              >
                <span />
              </button>
            </div>
            <button className="public-information-button" type="button">
              <span>
                <strong>Informações exibidas</strong>
                <small>Livros, categorias e descrição da biblioteca</small>
              </span>
              <span aria-hidden="true">›</span>
            </button>
          </section>

          <section className="public-tip">
            <span aria-hidden="true">
              <Icon name="info" />
            </span>
            <div>
              <h2>Dica</h2>
              <p>
                Compartilhe sua página em redes sociais, grupos ou com amigos
                que desejam pegar emprestado um livro.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
