export type GoogleBooksBook = Readonly<{
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  coverImageUrl: string;
}>;

export type GoogleBooksLookupResult =
  | Readonly<{ status: 'success'; book: GoogleBooksBook }>
  | Readonly<{ status: 'invalid'; message: string }>
  | Readonly<{ status: 'not_found'; message: string }>
  | Readonly<{
      status: 'error';
      category: 'timeout' | 'unavailable';
      message: string;
    }>;

export type GoogleBooksVolumeResponse = Readonly<{
  totalItems: number;
  items?: readonly Readonly<{
    volumeInfo?: Readonly<{
      title?: unknown;
      authors?: unknown;
      publisher?: unknown;
      imageLinks?: Readonly<{ thumbnail?: unknown }>;
    }>;
  }>[];
}>;
