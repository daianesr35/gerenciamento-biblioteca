export type PublicBook = Readonly<{
  id: string;
  isbn: string | null;
  title: string;
  author: string;
  publisher: string | null;
  coverImageUrl: string | null;
  category: string | null;
}>;

export type PublicLibraryResult =
  | Readonly<{
      status: 'success';
      ownerName: string;
      books: readonly PublicBook[];
    }>
  | Readonly<{ status: 'invalid_id' }>
  | Readonly<{ status: 'not_found' }>
  | Readonly<{ status: 'empty'; ownerName: string }>
  | Readonly<{ status: 'error'; category: 'unavailable' }>;
