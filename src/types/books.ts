export type BookStatus = 'disponivel' | 'emprestado';

export type Book = Readonly<{
  id: string;
  isbn: string | null;
  title: string;
  author: string;
  publisher: string | null;
  coverImageUrl: string | null;
  status: BookStatus;
}>;

export type BookListResult =
  | Readonly<{ status: 'success'; books: readonly Book[] }>
  | Readonly<{ status: 'error'; category: 'unavailable' }>;

export type BookDetailResult =
  | Readonly<{ status: 'success'; book: Book }>
  | Readonly<{ status: 'not_found'; book: null }>
  | Readonly<{ status: 'invalid_id'; book: null }>
  | Readonly<{ status: 'error'; category: 'unavailable' }>;
