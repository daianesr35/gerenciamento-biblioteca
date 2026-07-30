export type Loan = Readonly<{
  id: string;
  bookId: string;
  bookTitle: string;
  bookCoverImageUrl: string | null;
  requesterName: string;
  requesterPhone: string;
  loanedAt: string;
  returnedAt: string | null;
  status: 'Emprestado' | 'Devolvido';
}>;

export type AvailableLoanBook = Readonly<{
  id: string;
  title: string;
}>;

export type LoanListResult =
  | Readonly<{
      status: 'success';
      loans: readonly Loan[];
      availableBooks: readonly AvailableLoanBook[];
    }>
  | Readonly<{ status: 'error'; category: 'unavailable' }>;

export type LoanMutationResult =
  | Readonly<{ status: 'success' }>
  | Readonly<{
      status: 'invalid';
      fieldErrors: Partial<
        Readonly<Record<'bookId' | 'requesterName' | 'requesterPhone', string>>
      >;
    }>
  | Readonly<{
      status: 'error';
      category: 'book_unavailable' | 'invalid_loan' | 'unavailable';
    }>;

export type LoanActionState = Readonly<{ status: 'idle' }> | LoanMutationResult;
