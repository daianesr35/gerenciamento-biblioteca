'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';

import { LogoutButton } from '@/components/logout-button';
import { ButtonLink, SearchField } from '@/components/ui';

const navigation = [
  { href: '/dashboard', label: 'Início', icon: 'home' },
  { href: '/biblioteca', label: 'Livros', icon: 'books' },
  { href: '/emprestimos', label: 'Empréstimos', icon: 'loans' },
  { href: '/solicitacoes', label: 'Solicitações', icon: 'requests' },
  { href: '/pagina-publica', label: 'Página Pública', icon: 'public' },
  { href: '/configuracoes', label: 'Configurações', icon: 'settings' },
] as const;

type NavigationIcon = (typeof navigation)[number]['icon'];

function BookLogo() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 40 40">
      <path d="M20 10c-4-4-10-5-16-3v24c6-2 12-1 16 3m0-24c4-4 10-5 16-3v24c-6-2-12-1-16 3m0-24v24" />
    </svg>
  );
}

function NavIcon({ type }: { type: NavigationIcon }) {
  const paths = {
    home: (
      <>
        <path d="m3 12 9-8 9 8" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    books: (
      <>
        <path d="M11 6H6a3 3 0 0 0-3 3v12a3 3 0 0 1 3-3h5a5 5 0 0 1 4 2V9a5 5 0 0 0-4-3Z" />
        <path d="M19 6h-3v14a5 5 0 0 1 4-2h1V8a2 2 0 0 0-2-2Z" />
      </>
    ),
    loans: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="10" r="2.5" />
        <path d="M3 21c0-5 2-8 6-8s6 3 6 8M15 15c1-.7 2-1 3-1 3 0 5 2 5 6" />
      </>
    ),
    requests: (
      <>
        <rect height="18" rx="2" width="16" x="4" y="3" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),
    public: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c3 3 4 6 4 9s-1 6-4 9c-3-3-4-6-4-9s1-6 4-9Z" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12.2 2h-.4a2 2 0 0 0-2 2v.2a2 2 0 0 1-1 1.7l-.4.3a2 2 0 0 1-2 0l-.2-.1a2 2 0 0 0-2.7.7l-.2.4A2 2 0 0 0 4 9.9l.2.1a2 2 0 0 1 1 1.7v.5a2 2 0 0 1-1 1.8l-.2.1a2 2 0 0 0-.7 2.7l.2.4a2 2 0 0 0 2.7.7l.2-.1a2 2 0 0 1 2 0l.4.3a2 2 0 0 1 1 1.7v.2a2 2 0 0 0 2 2h.4a2 2 0 0 0 2-2v-.2a2 2 0 0 1 1-1.7l.4-.3a2 2 0 0 1 2 0l.2.1a2 2 0 0 0 2.7-.7l.2-.4a2 2 0 0 0-.7-2.7l-.2-.1a2 2 0 0 1-1-1.8v-.5a2 2 0 0 1 1-1.7l.2-.1a2 2 0 0 0 .7-2.7l-.2-.4a2 2 0 0 0-2.7-.7l-.2.1a2 2 0 0 1-2 0l-.4-.3a2 2 0 0 1-1-1.7V4a2 2 0 0 0-2-2Z" />
      </>
    ),
  } as const;

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isLibraryPage = pathname === '/biblioteca';
  const isLoansPage = pathname === '/emprestimos';
  const isRequestsPage = pathname === '/solicitacoes';
  const isNewBookPage = pathname === '/livros/novo';
  const isSettingsPage = pathname === '/configuracoes';
  const isProfilePage = pathname === '/perfil';
  const isPublicPage = pathname === '/pagina-publica';
  const isBookDetailsPage = pathname.startsWith('/livros/') && !isNewBookPage;
  const hasQuietTopbar =
    isLibraryPage ||
    isLoansPage ||
    isRequestsPage ||
    isSettingsPage ||
    isProfilePage ||
    isPublicPage ||
    isNewBookPage ||
    isBookDetailsPage;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      {menuOpen && (
        <button
          aria-label="Fechar menu"
          className="mobile-overlay"
          onClick={() => setMenuOpen(false)}
          type="button"
        />
      )}
      <aside
        aria-label="Navegação principal"
        className={`sidebar ${menuOpen ? 'open' : ''}`}
      >
        <Link className="brand" href="/dashboard">
          <span aria-hidden="true" className="brand-mark">
            <BookLogo />
          </span>
          Minha Biblioteca
        </Link>
        <nav>
          <ul className="nav-list">
            {navigation.map((item) => {
              const active =
                pathname === item.href ||
                (item.href === '/biblioteca' && pathname.startsWith('/livros'));
              return (
                <li key={item.href}>
                  <Link
                    aria-current={active ? 'page' : undefined}
                    className={`nav-link ${active ? 'active' : ''}`}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span aria-hidden="true" className="nav-icon">
                      <NavIcon type={item.icon} />
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <Link
          aria-current={isProfilePage ? 'page' : undefined}
          className="sidebar-user"
          href="/perfil"
        >
          <span aria-hidden="true" className="avatar">
            DR
          </span>
          <span className="user-copy">
            <strong>Daiane Ribeiro</strong>
            <span>Proprietária</span>
          </span>
        </Link>
        <LogoutButton />
      </aside>
      <div className="main-wrap">
        <header className={`topbar ${hasQuietTopbar ? 'library-topbar' : ''}`}>
          <button
            aria-expanded={menuOpen}
            aria-label="Abrir menu"
            className="icon-button menu-button"
            onClick={() => setMenuOpen(true)}
            type="button"
          >
            ☰
          </button>
          {!hasQuietTopbar && (
            <div className="top-search">
              <SearchField
                label="global"
                placeholder="Buscar livros por título, autor, ISBN ou categoria..."
              />
            </div>
          )}
          {!hasQuietTopbar && (
            <ButtonLink href="/livros/novo" variant="primary">
              + Adicionar livro
            </ButtonLink>
          )}
          <button
            aria-label="Notificações"
            className="icon-button"
            type="button"
          >
            <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
              <path d="M10 21h4" />
            </svg>
          </button>
          <Link aria-label="Abrir perfil" className="avatar" href="/perfil">
            DR
          </Link>
        </header>
        <main className="page" id="conteudo">
          {children}
        </main>
      </div>
    </div>
  );
}
