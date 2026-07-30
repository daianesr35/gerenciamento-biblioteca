import { listOwnLoanRequests } from '@/services/loan-requests';

import { RequestsList } from './requests-list';

export default async function RequestsPage() {
  const result = await listOwnLoanRequests();

  return (
    <div className="requests-page">
      <header className="requests-heading">
        <div>
          <h1>Solicitações</h1>
          <p className="subtitle">
            Gerencie as solicitações de empréstimo da sua biblioteca.
          </p>
        </div>
      </header>

      {result.status === 'error' ? (
        <section className="requests-list-card">
          <h2>Solicitações recebidas</h2>
          <p className="requests-empty" role="alert">
            Não foi possível carregar as solicitações. Tente novamente.
          </p>
        </section>
      ) : (
        <RequestsList requests={result.requests} />
      )}
    </div>
  );
}
