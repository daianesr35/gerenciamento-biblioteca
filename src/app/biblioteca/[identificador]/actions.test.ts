import { beforeEach, describe, expect, it, vi } from 'vitest';

import { submitPublicLoanRequest } from '@/services/loan-requests';

import { requestLoanAction } from './actions';

vi.mock('@/services/loan-requests', () => ({
  submitPublicLoanRequest: vi.fn(),
}));

const submitPublicLoanRequestMock = vi.mocked(submitPublicLoanRequest);

describe('Server Action da solicitação pública', () => {
  beforeEach(() => submitPublicLoanRequestMock.mockReset());

  it('lê os campos e retorna o resultado seguro do Service', async () => {
    submitPublicLoanRequestMock.mockResolvedValue({
      status: 'created',
      requestId: 'solicitacao-1',
    });
    const formData = new FormData();
    formData.set('publicIdentifier', '123e4567-e89b-42d3-a456-426614174000');
    formData.append('bookId', '223e4567-e89b-42d3-a456-426614174000');
    formData.append('bookId', '323e4567-e89b-42d3-a456-426614174000');
    formData.set('requesterName', 'Ana');
    formData.set('requesterPhone', '11999990000');

    await expect(
      requestLoanAction({ status: 'idle' }, formData),
    ).resolves.toEqual({
      status: 'created',
      requestId: 'solicitacao-1',
    });
    expect(submitPublicLoanRequestMock).toHaveBeenNthCalledWith(1, {
      publicIdentifier: '123e4567-e89b-42d3-a456-426614174000',
      bookId: '223e4567-e89b-42d3-a456-426614174000',
      requesterName: 'Ana',
      requesterPhone: '11999990000',
    });
    expect(submitPublicLoanRequestMock).toHaveBeenNthCalledWith(2, {
      publicIdentifier: '123e4567-e89b-42d3-a456-426614174000',
      bookId: '323e4567-e89b-42d3-a456-426614174000',
      requesterName: 'Ana',
      requesterPhone: '11999990000',
    });
  });

  it('remove IDs duplicados antes de criar as solicitações', async () => {
    submitPublicLoanRequestMock.mockResolvedValue({
      status: 'created',
      requestId: 'solicitacao-1',
    });
    const formData = new FormData();
    formData.set('publicIdentifier', '123e4567-e89b-42d3-a456-426614174000');
    formData.append('bookId', '223e4567-e89b-42d3-a456-426614174000');
    formData.append('bookId', '223e4567-e89b-42d3-a456-426614174000');
    formData.set('requesterName', 'Ana');
    formData.set('requesterPhone', '11999990000');

    await requestLoanAction({ status: 'idle' }, formData);

    expect(submitPublicLoanRequestMock).toHaveBeenCalledOnce();
  });

  it('não apresenta sucesso integral quando uma das criações falha', async () => {
    submitPublicLoanRequestMock
      .mockResolvedValueOnce({
        status: 'created',
        requestId: 'solicitacao-1',
      })
      .mockResolvedValueOnce({
        status: 'error',
        category: 'book_unavailable',
      });
    const formData = new FormData();
    formData.set('publicIdentifier', '123e4567-e89b-42d3-a456-426614174000');
    formData.append('bookId', '223e4567-e89b-42d3-a456-426614174000');
    formData.append('bookId', '323e4567-e89b-42d3-a456-426614174000');
    formData.set('requesterName', 'Ana');
    formData.set('requesterPhone', '11999990000');

    await expect(
      requestLoanAction({ status: 'idle' }, formData),
    ).resolves.toEqual({
      status: 'error',
      category: 'book_unavailable',
    });
    expect(submitPublicLoanRequestMock).toHaveBeenCalledTimes(2);
  });
});
