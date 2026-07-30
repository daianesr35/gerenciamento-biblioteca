import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { listOwnLoanRequests } from '@/services/loan-requests';
import RequestsPage from './page';

vi.mock('@/services/loan-requests', () => ({ listOwnLoanRequests: vi.fn() }));
vi.mock('./requests-list', () => ({
  RequestsList: ({
    requests,
  }: {
    requests: readonly { bookTitle: string }[];
  }) => <div>{requests.map((request) => request.bookTitle).join(',')}</div>,
}));

const listMock = vi.mocked(listOwnLoanRequests);

describe('página privada de solicitações', () => {
  beforeEach(() => listMock.mockReset());

  it('entrega as solicitações reais retornadas pelo Service', async () => {
    listMock.mockResolvedValue({
      status: 'success',
      requests: [
        {
          id: 'id',
          bookTitle: 'Livro da própria biblioteca',
          bookCoverImageUrl: null,
          requesterName: 'Ana',
          requesterPhone: '1199',
          requestedAt: '2026-07-30T12:00:00Z',
          status: 'pendente',
        },
      ],
    });
    const html = renderToStaticMarkup(await RequestsPage());
    expect(html).toContain('Livro da própria biblioteca');
    expect(html).not.toContain('Enviadas');
    expect(html).not.toContain('Histórico');
    expect(html).not.toContain('demonstração');
  });

  it('apresenta falha segura', async () => {
    listMock.mockResolvedValue({ status: 'error', category: 'unavailable' });
    const html = renderToStaticMarkup(await RequestsPage());
    expect(html).toContain('Não foi possível carregar as solicitações');
    expect(html).not.toContain('unavailable');
  });
});
