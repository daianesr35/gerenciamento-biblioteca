import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const listOwnLoans = vi.hoisted(() => vi.fn());
vi.mock('@/services/loans', () => ({ listOwnLoans }));
vi.mock('./loans-view', () => ({
  LoansView: ({ loans }: { loans: readonly { bookTitle: string }[] }) => (
    <div>{loans.map((loan) => loan.bookTitle).join(',')}</div>
  ),
}));

import LoansPage from './page';

beforeEach(() => listOwnLoans.mockReset());

describe('página de empréstimos', () => {
  it('entrega os dados reais do Service à tela aprovada', async () => {
    listOwnLoans.mockResolvedValue({
      status: 'success',
      loans: [{ bookTitle: 'Livro real' }],
      availableBooks: [],
    });
    const html = renderToStaticMarkup(await LoansPage());
    expect(html).toContain('Livro real');
    expect(html).not.toContain('demonstração');
  });

  it('apresenta erro seguro de consulta', async () => {
    listOwnLoans.mockResolvedValue({
      status: 'error',
      category: 'unavailable',
    });
    const html = renderToStaticMarkup(await LoansPage());
    expect(html).toContain('Não foi possível carregar os empréstimos');
    expect(html).not.toContain('unavailable');
  });
});
