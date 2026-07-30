import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

const useFormStatus = vi.hoisted(() => vi.fn(() => ({ pending: true })));

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useActionState: vi.fn((_action, initialState) => [initialState, vi.fn()]),
}));
vi.mock('react-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-dom')>()),
  useFormStatus,
}));
vi.mock('./actions', () => ({ manageLoanRequestAction: vi.fn() }));

import { RequestsList } from './requests-list';

describe('ações da solicitação', () => {
  it('desabilita confirmar e recusar durante a mesma operação', () => {
    const html = renderToStaticMarkup(
      <RequestsList
        requests={[
          {
            id: 'solicitacao-1',
            bookTitle: 'Livro',
            bookCoverImageUrl: null,
            requesterName: 'Ana',
            requesterPhone: '11999990000',
            requestedAt: '2026-07-30T12:00:00Z',
            status: 'pendente',
          },
        ]}
      />,
    );

    expect(html.match(/disabled=""/g)).toHaveLength(2);
    expect(html.match(/Processando…/g)).toHaveLength(2);
    expect(html).toContain('name="intent"');
    expect(html).toContain('value="confirm"');
    expect(html).toContain('value="refuse"');
  });
});
