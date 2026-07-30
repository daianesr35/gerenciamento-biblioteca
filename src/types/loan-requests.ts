export type PublicLoanRequestInput = Readonly<{
  publicIdentifier: string;
  bookId: string;
  requesterName: string;
  requesterPhone: string;
}>;

export type PublicLoanRequestFieldErrors = Readonly<{
  bookId?: string;
  requesterName?: string;
  requesterPhone?: string;
}>;

export type PublicLoanRequestResult =
  | Readonly<{ status: 'created'; requestId: string }>
  | Readonly<{
      status: 'invalid';
      fieldErrors: PublicLoanRequestFieldErrors;
    }>
  | Readonly<{
      status: 'error';
      category: 'book_unavailable' | 'unavailable';
    }>;

export type PublicLoanRequestActionState =
  | Readonly<{ status: 'idle' }>
  | PublicLoanRequestResult;

export type LoanRequestStatus = 'pendente' | 'confirmada' | 'recusada';

export type PrivateLoanRequest = Readonly<{
  id: string;
  bookTitle: string;
  bookCoverImageUrl: string | null;
  requesterName: string;
  requesterPhone: string;
  requestedAt: string;
  status: LoanRequestStatus;
}>;

export type PrivateLoanRequestListResult =
  | Readonly<{ status: 'success'; requests: readonly PrivateLoanRequest[] }>
  | Readonly<{ status: 'error'; category: 'unavailable' }>;

export type PrivateLoanRequestMutationResult =
  | Readonly<{ status: 'success' }>
  | Readonly<{
      status: 'error';
      category: 'invalid_request' | 'book_unavailable' | 'unavailable';
    }>;

export type PrivateLoanRequestActionState =
  | Readonly<{ status: 'idle' }>
  | PrivateLoanRequestMutationResult;
