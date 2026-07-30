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
