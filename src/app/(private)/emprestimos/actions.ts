'use server';

import { revalidatePath } from 'next/cache';

import { createDirectLoan, registerLoanReturn } from '@/services/loans';
import type { LoanActionState } from '@/types/loans';

function value(formData: FormData, name: string): string {
  const field = formData.get(name);
  return typeof field === 'string' ? field : '';
}

function revalidateLoans(): void {
  revalidatePath('/emprestimos');
  revalidatePath('/biblioteca');
}

export async function createDirectLoanAction(
  _state: LoanActionState,
  formData: FormData,
): Promise<LoanActionState> {
  const result = await createDirectLoan(
    value(formData, 'bookId'),
    value(formData, 'requesterName'),
    value(formData, 'requesterPhone'),
  );
  if (result.status === 'success') revalidateLoans();
  return result;
}

export async function registerLoanReturnAction(
  _state: LoanActionState,
  formData: FormData,
): Promise<LoanActionState> {
  const result = await registerLoanReturn(value(formData, 'loanId'));
  if (result.status === 'success') revalidateLoans();
  return result;
}
