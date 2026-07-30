export type PublicBook = Readonly<{
  id: string;
  isbn: string | null;
  title: string;
  author: string;
  publisher: string | null;
  coverImageUrl: string | null;
}>;

export type PublicLibraryResult =
  | Readonly<{ status: 'success'; books: readonly PublicBook[] }>
  | Readonly<{ status: 'invalid_id' }>
  | Readonly<{ status: 'not_found' }>
  | Readonly<{ status: 'empty' }>
  | Readonly<{ status: 'error'; category: 'unavailable' }>;
