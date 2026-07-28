'use client';

import { useMemo, useState, type ReactNode } from 'react';

import { Badge, Button, SearchField } from '@/components/ui';
import { loans } from '@/data/mock/library';

function LoanIcon({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      {children}
    </svg>
  );
}

const icons = {
  book: (
    <>
      <path d="M11 6H6a3 3 0 0 0-3 3v11a3 3 0 0 1 3-3h5a5 5 0 0 1 4 2V9a5 5 0 0 0-4-3Z" />
      <path d="M19 6h-3v13a5 5 0 0 1 4-2h1V8a2 2 0 0 0-2-2Z" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v5l3 2M5 5 3 1" />
    </>
  ),
};

export default function LoansPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'Todos' | 'Emprestado' | 'Devolvido'>(
    'Todos',
  );
  const [tab, setTab] = useState<'Ativos' | 'Histórico'>('Ativos');
  const [feedback, setFeedback] = useState('');

  const totals = useMemo(
    () => ({
      active: loans.filter((loan) => loan.status === 'Emprestado').length,
      returned: loans.filter((loan) => loan.status === 'Devolvido').length,
    }),
    [],
  );

  const filtered = useMemo(() => {
    const tabStatus = tab === 'Ativos' ? 'Emprestado' : 'Devolvido';
    return loans.filter(
      (loan) =>
        loan.status === tabStatus &&
        (status === 'Todos' || loan.status === status) &&
        `${loan.book} ${loan.person} ${loan.phone} ${loan.email}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    );
  }, [query, status, tab]);

  return (
    <div className="loans-page">
      <header className="loans-heading">
        <div>
          <h1>Empréstimos</h1>
          <p className="subtitle">
            Acompanhe todos os livros emprestados da sua biblioteca.
          </p>
        </div>
        <Button
          onClick={() =>
            setFeedback('O novo empréstimo é apenas visual nesta demonstração.')
          }
          variant="primary"
        >
          <LoanIcon>
            <path d="M12 5v14M5 12h14" />
          </LoanIcon>
          Novo empréstimo
        </Button>
      </header>

      <nav aria-label="Tipos de empréstimo" className="loans-tabs">
        <button
          aria-current={tab === 'Ativos' ? 'page' : undefined}
          className={tab === 'Ativos' ? 'active' : ''}
          onClick={() => {
            setTab('Ativos');
            setStatus('Todos');
          }}
          type="button"
        >
          <LoanIcon>{icons.book}</LoanIcon>
          Ativos
        </button>
        <button
          aria-current={tab === 'Histórico' ? 'page' : undefined}
          className={tab === 'Histórico' ? 'active' : ''}
          onClick={() => {
            setTab('Histórico');
            setStatus('Todos');
          }}
          type="button"
        >
          <LoanIcon>{icons.clock}</LoanIcon>
          Histórico
        </button>
      </nav>

      <div className="loans-layout">
        <div className="loans-main">
          <section
            aria-label="Indicadores de empréstimos"
            className="loans-stats"
          >
            <article className="request-stat success">
              <span className="request-stat-icon">
                <LoanIcon>{icons.book}</LoanIcon>
              </span>
              <div>
                <strong>{totals.active}</strong>
                <span>Emprestados</span>
                <small>Livros atualmente com leitores</small>
              </div>
            </article>
            <article className="request-stat info">
              <span className="request-stat-icon">
                <LoanIcon>{icons.check}</LoanIcon>
              </span>
              <div>
                <strong>{totals.returned}</strong>
                <span>Devolvidos</span>
                <small>Total de empréstimos concluídos</small>
              </div>
            </article>
          </section>

          <div className="loans-toolbar">
            <SearchField
              label="empréstimos"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por livro, pessoa ou telefone..."
              value={query}
            />
            <label className="loans-filter" htmlFor="status-emprestimo">
              <LoanIcon>
                <path d="M4 5h16l-6 7v6l-4 2v-8Z" />
              </LoanIcon>
              <span className="sr-only">Filtrar empréstimos por status</span>
              <select
                id="status-emprestimo"
                onChange={(event) =>
                  setStatus(
                    event.target.value as 'Todos' | 'Emprestado' | 'Devolvido',
                  )
                }
                value={status}
              >
                <option value="Todos">Filtros</option>
                <option value="Emprestado">Emprestados</option>
                <option value="Devolvido">Devolvidos</option>
              </select>
            </label>
            <label className="loans-order" htmlFor="ordem-emprestimo">
              <span className="sr-only">Ordenar empréstimos</span>
              <select id="ordem-emprestimo" defaultValue="recentes">
                <option value="recentes">Ordenar por: Mais recentes</option>
                <option value="antigos">Ordenar por: Mais antigos</option>
              </select>
            </label>
          </div>

          <section className="loans-list-card">
            <h2>
              {tab === 'Ativos' ? 'Empréstimos ativos' : 'Histórico'} (
              {filtered.length})
            </h2>
            {filtered.length ? (
              <div className="loans-list">
                {filtered.map((loan) => (
                  <article
                    className="loan-row"
                    key={`${loan.book}-${loan.person}`}
                  >
                    <div className="loan-book">
                      <span aria-hidden="true" className="loan-cover">
                        <LoanIcon>{icons.book}</LoanIcon>
                      </span>
                      <div>
                        <h3>{loan.book}</h3>
                        <span>Acervo pessoal</span>
                      </div>
                    </div>
                    <div className="loan-person">
                      <strong>
                        <LoanIcon>
                          <circle cx="12" cy="8" r="3" />
                          <path d="M6 20c0-5 2-7 6-7s6 2 6 7" />
                        </LoanIcon>
                        {loan.person}
                      </strong>
                      <span>
                        <LoanIcon>
                          <path d="M6 4h3l2 5-2 1c1 3 2 4 5 5l1-2 5 2v3c0 1-1 2-2 2C10 20 4 14 4 6c0-1 1-2 2-2Z" />
                        </LoanIcon>
                        {loan.phone}
                      </span>
                      <span>
                        <LoanIcon>
                          <rect height="14" rx="2" width="18" x="3" y="5" />
                          <path d="m4 7 8 6 8-6" />
                        </LoanIcon>
                        {loan.email}
                      </span>
                      <Badge tone="info">{loan.origin}</Badge>
                    </div>
                    <div className="loan-date">
                      <LoanIcon>
                        <rect height="15" rx="2" width="16" x="4" y="5" />
                        <path d="M8 3v4m8-4v4M4 9h16" />
                      </LoanIcon>
                      <span>
                        {loan.returnedAt ? 'Devolvido em' : 'Emprestado em'}
                        <strong>{loan.returnedAt ?? loan.loanedAt}</strong>
                      </span>
                    </div>
                    <div className="loan-status">
                      <Badge
                        tone={loan.status === 'Emprestado' ? 'success' : 'info'}
                      >
                        {loan.status}
                      </Badge>
                    </div>
                    <div className="loan-actions">
                      {loan.status === 'Emprestado' && (
                        <Button
                          onClick={() =>
                            setFeedback(
                              'A devolução foi registrada apenas nesta demonstração local.',
                            )
                          }
                        >
                          <LoanIcon>{icons.check}</LoanIcon>
                          Registrar devolução
                        </Button>
                      )}
                      <Button
                        onClick={() =>
                          setFeedback(
                            'Os detalhes são apenas visuais nesta demonstração.',
                          )
                        }
                      >
                        <LoanIcon>
                          <path d="M3 12s3-5 9-5 9 5 9 5-3 5-9 5-9-5-9-5Z" />
                          <circle cx="12" cy="12" r="2" />
                        </LoanIcon>
                        Ver detalhes
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="loans-empty" role="status">
                Nenhum empréstimo encontrado para os filtros selecionados.
              </p>
            )}

            <div className="loans-pagination">
              <p>
                Mostrando {filtered.length} de {loans.length} empréstimos
              </p>
              <nav aria-label="Paginação dos empréstimos">
                <Button aria-label="Página anterior" disabled>
                  <LoanIcon>
                    <path d="m14 7-5 5 5 5" />
                  </LoanIcon>
                </Button>
                <Button aria-current="page" variant="primary">
                  1
                </Button>
                <Button aria-label="Próxima página" disabled>
                  <LoanIcon>
                    <path d="m10 7 5 5-5 5" />
                  </LoanIcon>
                </Button>
              </nav>
              <label>
                <span className="sr-only">Empréstimos por página</span>
                <select defaultValue="10">
                  <option value="10">10 por página</option>
                </select>
              </label>
            </div>
          </section>
        </div>

        <aside className="loans-aside">
          <section className="loan-summary-card">
            <h2>Resumo dos empréstimos</h2>
            <ul>
              <li>
                <span>
                  <i className="active">
                    <LoanIcon>{icons.book}</LoanIcon>
                  </i>
                  Emprestados
                </span>
                <strong>{totals.active}</strong>
              </li>
              <li>
                <span>
                  <i className="returned">
                    <LoanIcon>{icons.check}</LoanIcon>
                  </i>
                  Devolvidos
                </span>
                <strong>{totals.returned}</strong>
              </li>
            </ul>
            <div className="loan-summary-total">
              <span>Total de empréstimos</span>
              <strong>{loans.length}</strong>
            </div>
          </section>

          <section className="loan-help-card">
            <h2>Como funciona?</h2>
            <ol>
              <li>Aprove uma solicitação de empréstimo.</li>
              <li>O livro será registrado nesta lista.</li>
              <li>Quando o livro for devolvido, registre a devolução.</li>
              <li>Acompanhe os status e mantenha tudo em dia.</li>
            </ol>
            <p>Este fluxo permanece apenas representado visualmente.</p>
          </section>
        </aside>
      </div>

      {feedback && (
        <div aria-live="polite" className="feedback" role="status">
          {feedback}
        </div>
      )}
    </div>
  );
}
