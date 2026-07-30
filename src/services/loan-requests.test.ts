import { describe, expect, it, vi } from 'vitest';

import { submitPublicLoanRequest } from './loan-requests';

const PUBLIC_IDENTIFIER = '123e4567-e89b-42d3-a456-426614174000';
const BOOK_ID = '223e4567-e89b-42d3-a456-426614174000';
const VALID_INPUT = {
  publicIdentifier: PUBLIC_IDENTIFIER,
  bookId: BOOK_ID,
  requesterName: 'Ana',
  requesterPhone: '11999990000',
};

describe('solicitação pública de empréstimo', () => {
  it('normaliza os dados e delega a criação ao adaptador', async () => {
    const createRequest = vi
      .fn()
      .mockResolvedValue({ requestId: 'solicitacao-1' });

    await expect(
      submitPublicLoanRequest(
        {
          ...VALID_INPUT,
          requesterName: '  Ana  ',
          requesterPhone: '  11999990000  ',
        },
        createRequest,
      ),
    ).resolves.toEqual({ status: 'created', requestId: 'solicitacao-1' });
    expect(createRequest).toHaveBeenCalledWith(VALID_INPUT);
  });

  it('valida livro, nome e telefone antes de chamar o adaptador', async () => {
    const createRequest = vi.fn();

    await expect(
      submitPublicLoanRequest(
        {
          ...VALID_INPUT,
          bookId: '',
          requesterName: ' ',
          requesterPhone: '',
        },
        createRequest,
      ),
    ).resolves.toEqual({
      status: 'invalid',
      fieldErrors: {
        bookId: 'Selecione um livro disponível.',
        requesterName: 'Informe seu nome.',
        requesterPhone: 'Informe seu telefone.',
      },
    });
    expect(createRequest).not.toHaveBeenCalled();
  });

  it('transforma falhas técnicas em categorias seguras', async () => {
    const unavailableBook = vi.fn().mockRejectedValue({
      code: 'book_unavailable',
      internalMessage: 'não expor',
    });
    const unexpected = vi.fn().mockRejectedValue(new Error('não expor'));

    await expect(
      submitPublicLoanRequest(VALID_INPUT, unavailableBook),
    ).resolves.toEqual({
      status: 'error',
      category: 'book_unavailable',
    });
    await expect(
      submitPublicLoanRequest(VALID_INPUT, unexpected),
    ).resolves.toEqual({ status: 'error', category: 'unavailable' });
  });

  it('rejeita o identificador inválido sem acessar o adaptador', async () => {
    const createRequest = vi.fn();

    await expect(
      submitPublicLoanRequest(
        { ...VALID_INPUT, publicIdentifier: 'biblioteca-invalida' },
        createRequest,
      ),
    ).resolves.toEqual({ status: 'error', category: 'unavailable' });
    expect(createRequest).not.toHaveBeenCalled();
  });
});
