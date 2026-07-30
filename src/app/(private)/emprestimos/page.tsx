import { listOwnLoans } from '@/services/loans';

import { LoansView } from './loans-view';

export default async function LoansPage() {
  const result = await listOwnLoans();
  if (result.status === 'error') {
    return (
      <div className="loans-page">
        <header className="loans-heading">
          <div>
            <h1>Empréstimos</h1>
            <p className="subtitle">
              Acompanhe todos os livros emprestados da sua biblioteca.
            </p>
          </div>
        </header>
        <section className="loans-list-card">
          <p className="loans-empty" role="alert">
            Não foi possível carregar os empréstimos. Tente novamente.
          </p>
        </section>
      </div>
    );
  }
  return (
    <LoansView availableBooks={result.availableBooks} loans={result.loans} />
  );
}
