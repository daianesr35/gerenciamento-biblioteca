import { describe, expect, it, vi } from 'vitest';

import {
  confirmLoanRequest,
  listOwnLoanRequests,
  refuseLoanRequest,
} from './loan-requests';

const REQUEST_ID = '123e4567-e89b-42d3-a456-426614174000';

describe('gerenciamento privado de solicitações', () => {
  it('mapeia somente os dados necessários da listagem', async () => {
    const list = vi.fn().mockResolvedValue([
      {
        id: REQUEST_ID,
        nome_solicitante: 'Ana',
        telefone_solicitante: '11999990000',
        data_solicitacao: '2026-07-30T12:00:00Z',
        status: 'pendente',
        livros: {
          titulo: 'Livro real',
          imagem_capa: 'https://example.com/capa.jpg',
        },
      },
    ]);
    await expect(listOwnLoanRequests(list)).resolves.toEqual({
      status: 'success',
      requests: [
        {
          id: REQUEST_ID,
          bookTitle: 'Livro real',
          bookCoverImageUrl: 'https://example.com/capa.jpg',
          requesterName: 'Ana',
          requesterPhone: '11999990000',
          requestedAt: '2026-07-30T12:00:00Z',
          status: 'pendente',
        },
      ],
    });
  });

  it('aceita lista vazia e oculta falhas internas', async () => {
    await expect(
      listOwnLoanRequests(vi.fn().mockResolvedValue([])),
    ).resolves.toEqual({
      status: 'success',
      requests: [],
    });
    await expect(
      listOwnLoanRequests(vi.fn().mockRejectedValue(new Error('segredo'))),
    ).resolves.toEqual({ status: 'error', category: 'unavailable' });
  });

  it('confirma, recusa e valida o identificador', async () => {
    const confirm = vi.fn().mockResolvedValue(undefined);
    const refuse = vi.fn().mockResolvedValue(undefined);
    await expect(confirmLoanRequest(REQUEST_ID, confirm)).resolves.toEqual({
      status: 'success',
    });
    await expect(refuseLoanRequest(REQUEST_ID, refuse)).resolves.toEqual({
      status: 'success',
    });
    await expect(confirmLoanRequest('invalido', confirm)).resolves.toEqual({
      status: 'error',
      category: 'invalid_request',
    });
    expect(confirm).toHaveBeenCalledTimes(1);
  });

  it('preserva categorias seguras e oculta outras falhas', async () => {
    await expect(
      confirmLoanRequest(
        REQUEST_ID,
        vi.fn().mockRejectedValue({ code: 'book_unavailable' }),
      ),
    ).resolves.toEqual({ status: 'error', category: 'book_unavailable' });
    await expect(
      refuseLoanRequest(
        REQUEST_ID,
        vi.fn().mockRejectedValue({ code: 'invalid_request' }),
      ),
    ).resolves.toEqual({ status: 'error', category: 'invalid_request' });
    await expect(
      confirmLoanRequest(
        REQUEST_ID,
        vi.fn().mockRejectedValue(new Error('interno')),
      ),
    ).resolves.toEqual({ status: 'error', category: 'unavailable' });
  });
});
