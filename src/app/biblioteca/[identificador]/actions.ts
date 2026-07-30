'use server';

import { submitPublicLoanRequest } from '@/services/loan-requests';
import type { PublicLoanRequestActionState } from '@/types/loan-requests';

function readFormValue(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === 'string' ? value : '';
}

export async function requestLoanAction(
  _previousState: PublicLoanRequestActionState,
  formData: FormData,
): Promise<PublicLoanRequestActionState> {
  return submitPublicLoanRequest({
    publicIdentifier: readFormValue(formData, 'publicIdentifier'),
    bookId: readFormValue(formData, 'bookId'),
    requesterName: readFormValue(formData, 'requesterName'),
    requesterPhone: readFormValue(formData, 'requesterPhone'),
  });
}
