import { createPublicLoanRequest } from '@/data/supabase/public';
import {
  confirmAuthenticatedLoanRequest,
  listAuthenticatedLoanRequestRows,
  refuseAuthenticatedLoanRequest,
  type PrivateLoanRequestRow,
} from '@/data/supabase/private-loan-requests';
import type {
  PrivateLoanRequestListResult,
  PrivateLoanRequestMutationResult,
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

function getBook(row: PrivateLoanRequestRow): {
  titulo: string;
  imagem_capa: string | null;
} {
  return Array.isArray(row.livros)
    ? (row.livros[0] ?? { titulo: '', imagem_capa: null })
    : (row.livros as { titulo: string; imagem_capa: string | null });
}

export async function listOwnLoanRequests(
  listRows = listAuthenticatedLoanRequestRows,
): Promise<PrivateLoanRequestListResult> {
  try {
    const rows = await listRows();
    return {
      status: 'success',
      requests: rows.map((row) => {
        const book = getBook(row);
        return {
          id: row.id,
          bookTitle: book.titulo,
          bookCoverImageUrl: book.imagem_capa,
          requesterName: row.nome_solicitante,
          requesterPhone: row.telefone_solicitante,
          requestedAt: row.data_solicitacao,
          status: row.status,
        };
      }),
    };
  } catch {
    return { status: 'error', category: 'unavailable' };
  }
}

type MutateRequest = (requestId: string) => Promise<void>;

async function mutatePendingRequest(
  requestId: string,
  mutate: MutateRequest,
): Promise<PrivateLoanRequestMutationResult> {
  if (!UUID_PATTERN.test(requestId)) {
    return { status: 'error', category: 'invalid_request' };
  }

  try {
    await mutate(requestId);
    return { status: 'success' };
  } catch (error) {
    const code = (error as { code?: string })?.code;
    return {
      status: 'error',
      category:
        code === 'book_unavailable'
          ? 'book_unavailable'
          : code === 'invalid_request'
            ? 'invalid_request'
            : 'unavailable',
    };
  }
}

export function confirmLoanRequest(
  requestId: string,
  confirm = confirmAuthenticatedLoanRequest,
): Promise<PrivateLoanRequestMutationResult> {
  return mutatePendingRequest(requestId, confirm);
}

export function refuseLoanRequest(
  requestId: string,
  refuse = refuseAuthenticatedLoanRequest,
): Promise<PrivateLoanRequestMutationResult> {
  return mutatePendingRequest(requestId, refuse);
}
