import { createPublicLoanRequest } from '@/data/supabase/public';
import type {
  PublicLoanRequestFieldErrors,
  PublicLoanRequestInput,
  PublicLoanRequestResult,
} from '@/types/loan-requests';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type CreateRequest = (
  input: PublicLoanRequestInput,
) => Promise<Readonly<{ requestId: string }>>;

function validatePublicLoanRequest(
  input: PublicLoanRequestInput,
): PublicLoanRequestFieldErrors {
  return {
    ...(!UUID_PATTERN.test(input.bookId)
      ? { bookId: 'Selecione um livro disponível.' }
      : {}),
    ...(input.requesterName.trim().length === 0
      ? { requesterName: 'Informe seu nome.' }
      : {}),
    ...(input.requesterPhone.trim().length === 0
      ? { requesterPhone: 'Informe seu telefone.' }
      : {}),
  };
}

export async function submitPublicLoanRequest(
  input: PublicLoanRequestInput,
  createRequest: CreateRequest = createPublicLoanRequest,
): Promise<PublicLoanRequestResult> {
  if (!UUID_PATTERN.test(input.publicIdentifier)) {
    return { status: 'error', category: 'unavailable' };
  }

  const fieldErrors = validatePublicLoanRequest(input);

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'invalid', fieldErrors };
  }

  try {
    const result = await createRequest({
      ...input,
      requesterName: input.requesterName.trim(),
      requesterPhone: input.requesterPhone.trim(),
    });

    return { status: 'created', requestId: result.requestId };
  } catch (error) {
    return {
      status: 'error',
      category:
        (error as { code?: string })?.code === 'book_unavailable'
          ? 'book_unavailable'
          : 'unavailable',
    };
  }
}
