import type { BookStatus } from '@/types/books';
import type { PublicBook } from '@/types/public-library';

export type BookRecommendationReason =
  | 'Mesma categoria'
  | 'Mesmo autor'
  | 'Mesma editora'
  | 'Título semelhante';

export type BookRecommendation<TBook extends PublicBook = PublicBook> =
  Readonly<{
    book: TBook;
    score: number;
    reasons: readonly BookRecommendationReason[];
  }>;

type RecommendationBook = PublicBook & Readonly<{ status?: BookStatus }>;

const MINIMUM_SCORE = 4;
const MAXIMUM_RECOMMENDATIONS = 3;

const CATEGORY_ALIASES: Readonly<Record<string, string>> = {
  art: 'arte',
  arts: 'arte',
  biography: 'biografia',
  business: 'negocios',
  computers: 'computacao',
  cooking: 'culinaria',
  education: 'educacao',
  fantasy: 'fantasia',
  fiction: 'ficcao',
  history: 'historia',
  horror: 'terror',
  humor: 'humor',
  mystery: 'misterio',
  nonfiction: 'nao ficcao',
  philosophy: 'filosofia',
  poetry: 'poesia',
  psychology: 'psicologia',
  religion: 'religiao',
  romance: 'romance',
  science: 'ciencia',
  'science fiction': 'ficcao cientifica',
  sports: 'esportes',
  technology: 'tecnologia',
  thriller: 'suspense',
  travel: 'viagem',
};

const STOP_WORDS = new Set([
  'a',
  'o',
  'as',
  'os',
  'de',
  'da',
  'do',
  'das',
  'dos',
  'e',
  'em',
  'no',
  'na',
  'nos',
  'nas',
  'um',
  'uma',
  'para',
  'por',
  'com',
  'the',
  'of',
  'and',
  'in',
  'to',
  'an',
  'for',
  'with',
]);

function normalizeText(value: string | null): string {
  return (value ?? '')
    .trim()
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function hasSameValue(left: string | null, right: string | null): boolean {
  const normalizedLeft = normalizeText(left);
  const normalizedRight = normalizeText(right);

  return normalizedLeft !== '' && normalizedLeft === normalizedRight;
}

function normalizeCategory(value: string | null): string {
  const normalized = normalizeText(value);
  return CATEGORY_ALIASES[normalized] ?? normalized;
}

function hasSameCategory(left: string | null, right: string | null): boolean {
  const normalizedLeft = normalizeCategory(left);
  const normalizedRight = normalizeCategory(right);

  return normalizedLeft !== '' && normalizedLeft === normalizedRight;
}

function normalizeIsbn(value: string | null): string {
  return (value ?? '').replace(/[^0-9X]/gi, '').toUpperCase();
}

function getTitleAuthorIdentity(book: RecommendationBook): string {
  return `${normalizeText(book.title)}|${normalizeText(book.author)}`;
}

function isSameBook(
  selectedBook: RecommendationBook,
  candidate: RecommendationBook,
): boolean {
  const selectedIsbn = normalizeIsbn(selectedBook.isbn);
  const candidateIsbn = normalizeIsbn(candidate.isbn);

  return (
    candidate.id === selectedBook.id ||
    (selectedIsbn !== '' &&
      candidateIsbn !== '' &&
      selectedIsbn === candidateIsbn) ||
    getTitleAuthorIdentity(candidate) === getTitleAuthorIdentity(selectedBook)
  );
}

function getRelevantTitleWords(title: string): Set<string> {
  return new Set(
    normalizeText(title)
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .split(/\s+/)
      .filter((word) => word !== '' && !STOP_WORDS.has(word)),
  );
}

function countSharedTitleWords(left: string, right: string): number {
  const leftWords = getRelevantTitleWords(left);
  const rightWords = getRelevantTitleWords(right);

  return [...leftWords].filter((word) => rightWords.has(word)).length;
}

function scoreCandidate<TBook extends RecommendationBook>(
  selectedBook: RecommendationBook,
  candidate: TBook,
): BookRecommendation<TBook> {
  let score = 0;
  const reasons: BookRecommendationReason[] = [];

  if (hasSameCategory(selectedBook.category, candidate.category)) {
    score += 5;
    reasons.push('Mesma categoria');
  }

  if (hasSameValue(selectedBook.author, candidate.author)) {
    score += 4;
    reasons.push('Mesmo autor');
  }

  if (hasSameValue(selectedBook.publisher, candidate.publisher)) {
    score += 2;
    reasons.push('Mesma editora');
  }

  const sharedTitleWords = countSharedTitleWords(
    selectedBook.title,
    candidate.title,
  );
  score += sharedTitleWords;

  if (sharedTitleWords > 0) {
    reasons.push('Título semelhante');
  }

  return { book: candidate, score, reasons };
}

export function recommendBooks<TBook extends RecommendationBook>(
  selectedBook: RecommendationBook,
  candidates: readonly TBook[],
): readonly BookRecommendation<TBook>[] {
  const seenIsbns = new Set<string>();
  const seenTitlesAndAuthors = new Set<string>();

  return candidates
    .filter((candidate) => {
      if (
        isSameBook(selectedBook, candidate) ||
        candidate.status === 'emprestado'
      ) {
        return false;
      }

      const isbn = normalizeIsbn(candidate.isbn);
      const titleAndAuthor = getTitleAuthorIdentity(candidate);
      if (
        (isbn !== '' && seenIsbns.has(isbn)) ||
        seenTitlesAndAuthors.has(titleAndAuthor)
      ) {
        return false;
      }

      if (isbn !== '') {
        seenIsbns.add(isbn);
      }
      seenTitlesAndAuthors.add(titleAndAuthor);
      return true;
    })
    .map((candidate) => scoreCandidate(selectedBook, candidate))
    .filter(({ score }) => score >= MINIMUM_SCORE)
    .sort((left, right) => {
      const scoreComparison = right.score - left.score;
      if (scoreComparison !== 0) return scoreComparison;

      const titleComparison = normalizeText(left.book.title).localeCompare(
        normalizeText(right.book.title),
        'pt-BR',
      );
      if (titleComparison !== 0) return titleComparison;

      return left.book.id.localeCompare(right.book.id);
    })
    .slice(0, MAXIMUM_RECOMMENDATIONS);
}
