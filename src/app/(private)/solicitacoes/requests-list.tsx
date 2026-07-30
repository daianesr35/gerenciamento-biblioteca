'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { Badge, Button } from '@/components/ui';
import type {
  PrivateLoanRequest,
  PrivateLoanRequestActionState,
} from '@/types/loan-requests';

import { manageLoanRequestAction } from './actions';

const INITIAL_STATE: PrivateLoanRequestActionState = { status: 'idle' };
const STATUS = {
  pendente: { label: 'Pendente', tone: 'info' as const },
  confirmada: { label: 'Confirmada', tone: 'success' as const },
  recusada: { label: 'Recusada', tone: 'danger' as const },
};

function ActionButton({
  children,
  intent,
  variant,
}: {
  children: string;
  intent: 'confirm' | 'refuse';
  variant: 'primary' | 'danger';
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      disabled={pending}
      name="intent"
      type="submit"
      value={intent}
      variant={variant}
    >
      {pending ? 'Processando…' : children}
    </Button>
  );
}

function RequestActions({
  active,
  requestId,
}: {
  active: boolean;
  requestId: string;
}) {
  const [state, requestAction] = useActionState(
    manageLoanRequestAction,
    INITIAL_STATE,
  );
  const feedback =
    state.status === 'success'
      ? 'Solicitação atualizada com sucesso.'
      : state.status === 'error'
        ? state.category === 'book_unavailable'
          ? 'O livro não está mais disponível.'
          : state.category === 'invalid_request'
            ? 'Esta solicitação não pode mais ser processada.'
            : 'Não foi possível atualizar a solicitação. Tente novamente.'
        : null;

  return (
    <div>
      <div className="request-actions">
        {active && (
          <form action={requestAction}>
            <input name="requestId" type="hidden" value={requestId} />
            <ActionButton intent="confirm" variant="primary">
              Confirmar
            </ActionButton>
            <ActionButton intent="refuse" variant="danger">
              Recusar
            </ActionButton>
          </form>
        )}
      </div>
      {feedback && (
        <p
          className={state.status === 'error' ? 'error' : 'success'}
          role="status"
        >
          {feedback}
        </p>
      )}
    </div>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value));
}

export function RequestsList({
  requests,
}: {
  requests: readonly PrivateLoanRequest[];
}) {
  return (
    <section className="requests-list-card">
      <h2>Solicitações recebidas</h2>
      {requests.length === 0 ? (
        <p className="requests-empty" role="status">
          Nenhuma solicitação encontrada.
        </p>
      ) : (
        <div className="requests-list">
          {requests.map((request) => {
            const detail = STATUS[request.status];
            return (
              <article className="request-row" key={request.id}>
                <div className="request-cover">
                  {request.bookCoverImageUrl ? (
                    // A URL da capa é um dado bibliográfico e pode ter qualquer host.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={`Capa de ${request.bookTitle}`}
                      src={request.bookCoverImageUrl}
                    />
                  ) : (
                    <svg
                      aria-label="Capa indisponível"
                      role="img"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 4h9a3 3 0 0 1 3 3v13H8a2 2 0 0 1-2-2Z" />
                      <path d="M9 4v16M6 17h12" />
                    </svg>
                  )}
                </div>
                <div className="request-book">
                  <h3>{request.bookTitle}</h3>
                  <Badge tone={detail.tone}>{detail.label}</Badge>
                </div>
                <div className="request-borrower">
                  <span className="request-label">Solicitante</span>
                  <strong className="request-person">
                    {request.requesterName}
                  </strong>
                  <a href={`tel:${request.requesterPhone}`}>
                    {request.requesterPhone}
                  </a>
                </div>
                <div className="request-date">
                  <span>
                    Solicitado em:
                    <strong>{formatDate(request.requestedAt)}</strong>
                  </span>
                </div>
                <RequestActions
                  active={request.status === 'pendente'}
                  requestId={request.id}
                />
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
