'use client';

import { useMemo, useState, type ReactNode } from 'react';

import { Badge, Button, SearchField } from '@/components/ui';
import { requests } from '@/data/mock/library';

function RequestIcon({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  );
}

const statusDetails = {
  Pendente: {
    tone: 'info' as const,
    label: 'Aguardando resposta',
    icon: (
      <>
        <path d="M4 7.5h16v12H4z" />
        <path d="M4 12h4l1.5 2h5L16 12h4M8 7.5 9.5 4h5L16 7.5" />
      </>
    ),
  },
  Aprovada: {
    tone: 'success' as const,
    label: 'Aguardando retirada',
    icon: (
      <>
        <rect height="16" rx="2" width="16" x="4" y="4" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),
  },
  Recusada: {
    tone: 'danger' as const,
    label: 'Não aprovada',
    icon: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="m9 9 6 6m0-6-6 6" />
      </>
    ),
  },
};

export default function RequestsPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Todos');
  const [feedback, setFeedback] = useState('');
  const filtered = useMemo(
    () =>
      requests.filter(
        (request) =>
          (status === 'Todos' || request.status === status) &&
          `${request.book} ${request.person} ${request.status}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      ),
    [query, status],
  );

  const totals = useMemo(
    () =>
      requests.reduce(
        (summary, request) => {
          summary[request.status] += 1;
          return summary;
        },
        { Pendente: 0, Aprovada: 0, Recusada: 0 },
      ),
    [],
  );

  return (
    <div className="requests-page">
      <header className="requests-heading">
        <div>
          <h1>Solicitações</h1>
          <p className="subtitle">
            Acompanhe e gerencie todas as solicitações de empréstimo.
          </p>
        </div>
      </header>

      <nav aria-label="Tipos de solicitação" className="requests-tabs">
        <button aria-current="page" className="active" type="button">
          <RequestIcon>
            <path d="M5 9v10h14V9M8 5v4m8-4v4M4 9h16" />
          </RequestIcon>
          Recebidas
        </button>
        <button
          onClick={() =>
            setFeedback('A aba Enviadas é apenas visual nesta demonstração.')
          }
          type="button"
        >
          <RequestIcon>
            <path d="M12 16V4m-4 4 4-4 4 4M5 14v5h14v-5" />
          </RequestIcon>
          Enviadas
        </button>
        <button
          onClick={() =>
            setFeedback('O histórico é apenas visual nesta demonstração.')
          }
          type="button"
        >
          <RequestIcon>
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v4l3 2M5 5l-2 3" />
          </RequestIcon>
          Histórico
        </button>
      </nav>

      <div className="requests-layout">
        <div className="requests-main">
          <div className="requests-toolbar">
            <SearchField
              label="solicitações"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nome, livro ou status..."
              value={query}
            />
            <label className="requests-filter" htmlFor="status-solicitacao">
              <RequestIcon>
                <path d="M4 5h16l-6 7v6l-4 2v-8Z" />
              </RequestIcon>
              <span className="sr-only">Filtrar solicitações por status</span>
              <select
                id="status-solicitacao"
                onChange={(event) => setStatus(event.target.value)}
                value={status}
              >
                <option value="Todos">Todos os status</option>
                <option value="Pendente">Pendentes</option>
                <option value="Aprovada">Aprovadas</option>
                <option value="Recusada">Recusadas</option>
              </select>
            </label>
            <label className="requests-order" htmlFor="ordem-solicitacao">
              <span className="sr-only">Ordenar solicitações</span>
              <select id="ordem-solicitacao" defaultValue="recentes">
                <option value="recentes">Ordenar: Mais recentes</option>
                <option value="antigas">Ordenar: Mais antigas</option>
              </select>
            </label>
          </div>

          <section aria-label="Resumo por status" className="requests-stats">
            {Object.entries(statusDetails).map(([itemStatus, detail]) => (
              <article
                className={`request-stat ${detail.tone}`}
                key={itemStatus}
              >
                <span className="request-stat-icon">
                  <RequestIcon>{detail.icon}</RequestIcon>
                </span>
                <div>
                  <strong>{totals[itemStatus as keyof typeof totals]}</strong>
                  <span>
                    {itemStatus === 'Aprovada' ? 'Aprovadas' : `${itemStatus}s`}
                  </span>
                  <small>{detail.label}</small>
                </div>
              </article>
            ))}
          </section>

          <section className="requests-list-card">
            <h2>Solicitações recebidas</h2>
            {filtered.length ? (
              <div className="requests-list">
                {filtered.map((request) => {
                  const detail = statusDetails[request.status];
                  const initials = request.person
                    .split(' ')
                    .map((name) => name[0])
                    .slice(0, 2)
                    .join('');

                  return (
                    <article
                      className="request-row"
                      key={`${request.book}-${request.person}`}
                    >
                      <div className="request-book">
                        <span aria-hidden="true" className="request-cover">
                          <RequestIcon>
                            <path d="M6 4h9a3 3 0 0 1 3 3v13H8a2 2 0 0 1-2-2Z" />
                            <path d="M9 4v16M6 17h12" />
                          </RequestIcon>
                        </span>
                        <div>
                          <h3>{request.book}</h3>
                          <span className="request-label">Solicitante</span>
                          <strong className="request-person">
                            <span aria-hidden="true">{initials}</span>
                            {request.person}
                          </strong>
                        </div>
                      </div>
                      <div className="request-status">
                        <Badge tone={detail.tone}>{request.status}</Badge>
                      </div>
                      <div className="request-date">
                        <RequestIcon>
                          <rect height="15" rx="2" width="16" x="4" y="5" />
                          <path d="M8 3v4m8-4v4M4 9h16" />
                        </RequestIcon>
                        <span>
                          Solicitado em
                          <strong>{request.requestedAt}</strong>
                        </span>
                      </div>
                      <div className="request-actions">
                        {request.status === 'Pendente' ? (
                          <>
                            <Button
                              className="request-approve"
                              onClick={() =>
                                setFeedback(
                                  'Solicitação aprovada apenas nesta demonstração local.',
                                )
                              }
                            >
                              <RequestIcon>
                                <path d="m5 12 4 4L19 6" />
                              </RequestIcon>
                              Aprovar
                            </Button>
                            <Button
                              onClick={() =>
                                setFeedback(
                                  'Solicitação recusada apenas nesta demonstração local.',
                                )
                              }
                              variant="danger"
                            >
                              <RequestIcon>
                                <path d="m7 7 10 10m0-10L7 17" />
                              </RequestIcon>
                              Recusar
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() =>
                              setFeedback(
                                'Os detalhes são apenas visuais nesta demonstração.',
                              )
                            }
                          >
                            <RequestIcon>
                              <path d="M3 12s3-5 9-5 9 5 9 5-3 5-9 5-9-5-9-5Z" />
                              <circle cx="12" cy="12" r="2" />
                            </RequestIcon>
                            Detalhes
                          </Button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="requests-empty" role="status">
                Nenhuma solicitação encontrada para os filtros selecionados.
              </p>
            )}

            <div className="requests-pagination">
              <p>
                Mostrando {filtered.length} de {requests.length} solicitações
              </p>
              <nav aria-label="Paginação das solicitações">
                <Button aria-label="Página anterior" disabled>
                  <RequestIcon>
                    <path d="m14 7-5 5 5 5" />
                  </RequestIcon>
                </Button>
                <Button aria-current="page" variant="primary">
                  1
                </Button>
                <Button aria-label="Próxima página" disabled>
                  <RequestIcon>
                    <path d="m10 7 5 5-5 5" />
                  </RequestIcon>
                </Button>
              </nav>
              <label>
                <span className="sr-only">Solicitações por página</span>
                <select defaultValue="10">
                  <option value="10">10 por página</option>
                </select>
              </label>
            </div>
          </section>
        </div>

        <aside className="requests-aside">
          <section className="request-summary-card">
            <h2>Resumo das solicitações</h2>
            <ul>
              {Object.entries(statusDetails).map(([itemStatus, detail]) => (
                <li key={itemStatus}>
                  <span className={`summary-status ${detail.tone}`}>
                    <RequestIcon>{detail.icon}</RequestIcon>
                    {itemStatus === 'Aprovada' ? 'Aprovadas' : `${itemStatus}s`}
                  </span>
                  <strong>{totals[itemStatus as keyof typeof totals]}</strong>
                </li>
              ))}
            </ul>
            <div className="request-summary-total">
              <span>Total</span>
              <strong>{requests.length}</strong>
            </div>
          </section>

          <section className="request-help-card">
            <h2>Como funciona?</h2>
            <ol>
              <li>O leitor solicita um livro</li>
              <li>Você aprova ou recusa</li>
              <li>O empréstimo segue o fluxo previsto</li>
            </ol>
            <p>Este fluxo permanece apenas representado visualmente.</p>
          </section>

          <section className="request-tip-card">
            <RequestIcon>
              <path d="m12 3 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7Z" />
            </RequestIcon>
            <div>
              <h2>Dica</h2>
              <p>
                Mantenha seus dados atualizados para facilitar o contato com os
                leitores.
              </p>
            </div>
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
