'use server';

import { revalidatePath } from 'next/cache';

import {
  confirmLoanRequest,
  refuseLoanRequest,
} from '@/services/loan-requests';
import type { PrivateLoanRequestActionState } from '@/types/loan-requests';

function readRequestId(formData: FormData): string {
  const value = formData.get('requestId');
  return typeof value === 'string' ? value : '';
}

export async function manageLoanRequestAction(
  _previousState: PrivateLoanRequestActionState,
  formData: FormData,
): Promise<PrivateLoanRequestActionState> {
  const result =
    formData.get('intent') === 'confirm'
      ? await confirmLoanRequest(readRequestId(formData))
      : await refuseLoanRequest(readRequestId(formData));
  if (result.status === 'success') revalidatePath('/solicitacoes');
  return result;
}
