import { beforeEach, describe, expect, it, vi } from 'vitest';

const createDirectLoan = vi.hoisted(() => vi.fn());
const registerLoanReturn = vi.hoisted(() => vi.fn());
const revalidatePath = vi.hoisted(() => vi.fn());
vi.mock('@/services/loans', () => ({ createDirectLoan, registerLoanReturn }));
vi.mock('next/cache', () => ({ revalidatePath }));

import { createDirectLoanAction, registerLoanReturnAction } from './actions';

beforeEach(() => {
  createDirectLoan.mockReset();
  registerLoanReturn.mockReset();
  revalidatePath.mockReset();
});

describe('Server Actions de empréstimos', () => {
  it('registra empréstimo e revalida as telas afetadas', async () => {
    createDirectLoan.mockResolvedValue({ status: 'success' });
    const data = new FormData();
    data.set('bookId', 'livro');
    data.set('requesterName', 'Ana');
    data.set('requesterPhone', '1199');
    await createDirectLoanAction({ status: 'idle' }, data);
    expect(createDirectLoan).toHaveBeenCalledWith('livro', 'Ana', '1199');
    expect(revalidatePath).toHaveBeenCalledWith('/emprestimos');
    expect(revalidatePath).toHaveBeenCalledWith('/biblioteca');
  });

  it('não revalida uma devolução recusada', async () => {
    registerLoanReturn.mockResolvedValue({
      status: 'error',
      category: 'invalid_loan',
    });
    const data = new FormData();
    data.set('loanId', 'emprestimo');
    await expect(
      registerLoanReturnAction({ status: 'idle' }, data),
    ).resolves.toEqual({ status: 'error', category: 'invalid_loan' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
