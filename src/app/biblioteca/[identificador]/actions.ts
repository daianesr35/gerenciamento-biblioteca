'use server';

import { submitPublicLoanRequest } from '@/services/loan-requests';
import type { PublicLoanRequestActionState } from '@/types/loan-requests';

function readFormValue(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === 'string' ? value : '';
}

function readFormValues(formData: FormData, field: string): string[] {
  return formData
    .getAll(field)
    .filter((value): value is string => typeof value === 'string');
}

export async function requestLoanAction(
  _previousState: PublicLoanRequestActionState,
  formData: FormData,
): Promise<PublicLoanRequestActionState> {
  const publicIdentifier = readFormValue(formData, 'publicIdentifier');
  const requesterName = readFormValue(formData, 'requesterName');
  const requesterPhone = readFormValue(formData, 'requesterPhone');
  const bookIds = [...new Set(readFormValues(formData, 'bookId'))];

  if (bookIds.length === 0) {
    bookIds.push('');
  }

  const results = await Promise.all(
    bookIds.map((bookId) =>
      submitPublicLoanRequest({
        publicIdentifier,
        bookId,
        requesterName,
        requesterPhone,
      }),
    ),
  );
  const failedResult = results.find((result) => result.status !== 'created');

  return failedResult ?? results[0];
}
