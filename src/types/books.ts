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

export type CreateBookInput = Readonly<{
  isbn: string | null;
  title: string;
  author: string;
  publisher: string | null;
  coverImageUrl: string | null;
}>;

export type CreateBookFieldErrors = Partial<
  Readonly<Record<'title' | 'author' | 'coverImageUrl', string>>
>;

export type CreateBookResult =
  | Readonly<{ status: 'success' }>
  | Readonly<{ status: 'invalid'; fieldErrors: CreateBookFieldErrors }>
  | Readonly<{ status: 'error'; category: 'unavailable' }>;

export type CreateBookActionState =
  | Readonly<{ status: 'idle' }>
  | CreateBookResult;

export type UpdateBookInput = CreateBookInput;

export type UpdateBookResult =
  | Readonly<{ status: 'success' }>
  | Readonly<{ status: 'invalid_id' }>
  | Readonly<{ status: 'invalid'; fieldErrors: CreateBookFieldErrors }>
  | Readonly<{ status: 'not_found' }>
  | Readonly<{ status: 'error'; category: 'unavailable' }>;

export type UpdateBookActionState =
  | Readonly<{ status: 'idle' }>
  | UpdateBookResult;

export type DeleteBookResult =
  | Readonly<{ status: 'success' }>
  | Readonly<{ status: 'invalid_id' }>
  | Readonly<{ status: 'not_found' }>
  | Readonly<{ status: 'related_records' }>
  | Readonly<{ status: 'error'; category: 'unavailable' }>;

export type DeleteBookActionState =
  | Readonly<{ status: 'idle' }>
  | Readonly<{ status: 'error'; message: string }>;
