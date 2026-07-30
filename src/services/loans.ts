import {
  createAuthenticatedDirectLoan,
  listAuthenticatedAvailableBookRows,
  listAuthenticatedLoanRows,
  returnAuthenticatedLoan,
  type LoanRow,
} from '@/data/supabase/loans';
import type { LoanListResult, LoanMutationResult } from '@/types/loans';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function book(
  row: LoanRow,
): Readonly<{ titulo: string; imagem_capa: string | null }> {
  return Array.isArray(row.livros)
    ? (row.livros[0] ?? { titulo: '', imagem_capa: null })
    : (row.livros as { titulo: string; imagem_capa: string | null });
}

export async function listOwnLoans(
  listLoans = listAuthenticatedLoanRows,
  listBooks = listAuthenticatedAvailableBookRows,
): Promise<LoanListResult> {
  try {
    const [rows, books] = await Promise.all([listLoans(), listBooks()]);
    return {
      status: 'success',
      loans: rows.map((row) => {
        const loanBook = book(row);
        return {
          id: row.id,
          bookId: row.livro_id,
          bookTitle: loanBook.titulo,
          bookCoverImageUrl: loanBook.imagem_capa,
          requesterName: row.nome_solicitante,
          requesterPhone: row.telefone_solicitante,
          loanedAt: row.data_emprestimo,
          returnedAt: row.data_devolucao,
          status: row.data_devolucao ? 'Devolvido' : 'Emprestado',
        };
      }),
      availableBooks: books.map((book) => ({
        id: book.id,
        title: book.titulo,
      })),
    };
  } catch {
    return { status: 'error', category: 'unavailable' };
  }
}

export async function createDirectLoan(
  bookId: string,
  requesterName: string,
  requesterPhone: string,
  create = createAuthenticatedDirectLoan,
): Promise<LoanMutationResult> {
  const fieldErrors = {
    ...(!UUID_PATTERN.test(bookId)
      ? { bookId: 'Selecione um livro disponível.' }
      : {}),
    ...(requesterName.trim() ? {} : { requesterName: 'Informe o nome.' }),
    ...(requesterPhone.trim() ? {} : { requesterPhone: 'Informe o telefone.' }),
  };
  if (Object.keys(fieldErrors).length)
    return { status: 'invalid', fieldErrors };
  try {
    await create(bookId, requesterName.trim(), requesterPhone.trim());
    return { status: 'success' };
  } catch (error) {
    return {
      status: 'error',
      category:
        (error as { code?: string }).code === 'book_unavailable'
          ? 'book_unavailable'
          : 'unavailable',
    };
  }
}

export async function registerLoanReturn(
  loanId: string,
  register = returnAuthenticatedLoan,
): Promise<LoanMutationResult> {
  if (!UUID_PATTERN.test(loanId)) {
    return { status: 'error', category: 'invalid_loan' };
  }
  try {
    await register(loanId);
    return { status: 'success' };
  } catch (error) {
    return {
      status: 'error',
      category:
        (error as { code?: string }).code === 'invalid_loan'
          ? 'invalid_loan'
          : 'unavailable',
    };
  }
}
