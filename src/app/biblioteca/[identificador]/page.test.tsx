import { isValidElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getPublicLibrary } from '@/services/public-library';

import PublicLibraryPage from './page';
import {
  BookRecommendations,
  filterPublicBooks,
  PublicCatalog,
  PublicRequestForm,
  updateBookSelection,
} from './public-catalog';

vi.mock('@/services/public-library', () => ({
  getPublicLibrary: vi.fn(),
}));

const getPublicLibraryMock = vi.mocked(getPublicLibrary);
const IDENTIFIER = '123e4567-e89b-42d3-a456-426614174000';

function findButton(node: ReactNode): (() => void) | undefined {
  if (Array.isArray(node)) {
    return node.map(findButton).find(Boolean);
  }

  if (!isValidElement<{ children?: ReactNode; onClick?: () => void }>(node)) {
    return undefined;
  }

  if (node.props.onClick) {
    return node.props.onClick;
  }

  return findButton(node.props.children);
}

describe('Página da Biblioteca pública', () => {
  beforeEach(() => getPublicLibraryMock.mockReset());

  it('exibe banner neutro e somente os dados públicos dos livros', async () => {
    getPublicLibraryMock.mockResolvedValue({
      status: 'success',
      ownerName: 'Maria da Silva',
      books: [
        {
          id: 'livro-1',
          isbn: null,
          title: 'Livro real',
          author: 'Autora real',
          publisher: 'Editora real',
          coverImageUrl: null,
          category: null,
        },
      ],
    });

    const html = renderToStaticMarkup(
      await PublicLibraryPage({
        params: Promise.resolve({ identificador: IDENTIFIER }),
      }),
    );

    expect(getPublicLibraryMock).toHaveBeenCalledWith(IDENTIFIER);
    expect(html).toContain('Biblioteca de Maria da Silva');
    expect(html).toContain('Livro real');
    expect(html).toContain('Autora real');
    expect(html).toContain('Editora real');
    expect(html).toContain('Capa indisponível de Livro real');
    expect(html).toContain('Solicitar');
    expect(html).not.toContain('QR Code');
    expect(html).not.toContain('Configurações');
    expect(html).not.toContain('href=');
  });

  it('exibe estados de Biblioteca inexistente, catálogo vazio e erro', async () => {
    getPublicLibraryMock.mockResolvedValueOnce({ status: 'not_found' });
    const missing = renderToStaticMarkup(
      await PublicLibraryPage({
        params: Promise.resolve({ identificador: IDENTIFIER }),
      }),
    );
    expect(missing).toContain('Biblioteca não encontrada');

    getPublicLibraryMock.mockResolvedValueOnce({
      status: 'empty',
      ownerName: 'Maria da Silva',
    });
    const empty = renderToStaticMarkup(
      await PublicLibraryPage({
        params: Promise.resolve({ identificador: IDENTIFIER }),
      }),
    );
    expect(empty).toContain(
      'Esta biblioteca ainda não possui livros disponíveis.',
    );

    getPublicLibraryMock.mockResolvedValueOnce({
      status: 'error',
      category: 'unavailable',
    });
    const error = renderToStaticMarkup(
      await PublicLibraryPage({
        params: Promise.resolve({ identificador: IDENTIFIER }),
      }),
    );
    expect(error).toContain('Não foi possível carregar a biblioteca.');
    expect(error).not.toContain('unavailable');
  });

  it('oferece pesquisa local por título ou autor e seu estado sem resultados', () => {
    const books = [
      {
        id: 'livro-1',
        isbn: null,
        title: 'Dom Casmurro',
        author: 'Machado de Assis',
        publisher: null,
        coverImageUrl: null,
        category: null,
      },
    ];
    const html = renderToStaticMarkup(
      <PublicCatalog books={books} publicIdentifier={IDENTIFIER} />,
    );

    expect(html).toContain('Pesquisar por título ou autor');
    expect(html).toContain('Dom Casmurro');
    expect(html).toContain('Machado de Assis');
    expect(filterPublicBooks(books, 'dom')).toHaveLength(1);
    expect(filterPublicBooks(books, 'MACHADO')).toHaveLength(1);
    expect(filterPublicBooks(books, 'clarice')).toHaveLength(0);

    const emptySearch = renderToStaticMarkup(
      <PublicCatalog books={[]} publicIdentifier={IDENTIFIER} />,
    );
    expect(emptySearch).toContain(
      'Nenhum livro encontrado para esta pesquisa.',
    );
  });

  it('oferece a seleção do livro antes de abrir o formulário', () => {
    const html = renderToStaticMarkup(
      <PublicCatalog
        books={[
          {
            id: '223e4567-e89b-42d3-a456-426614174000',
            isbn: null,
            title: 'Livro disponível',
            author: 'Autora',
            publisher: null,
            coverImageUrl: null,
            category: null,
          },
        ]}
        publicIdentifier={IDENTIFIER}
      />,
    );

    expect(html).toContain('Solicitar');
    expect(html).not.toContain('name="requesterName"');
    expect(html).not.toContain('name="requesterPhone"');
    expect(html).not.toContain('Você também pode gostar');
  });

  it('mantém o primeiro Livro ao adicionar e remover uma recomendação', () => {
    const first = updateBookSelection([], '', 'livro-principal');
    const withRecommendation = updateBookSelection(
      first.selectedBookIds,
      first.primaryBookId,
      'livro-recomendado',
    );
    const withoutRecommendation = updateBookSelection(
      withRecommendation.selectedBookIds,
      withRecommendation.primaryBookId,
      'livro-recomendado',
    );

    expect(withRecommendation).toEqual({
      selectedBookIds: ['livro-principal', 'livro-recomendado'],
      primaryBookId: 'livro-principal',
    });
    expect(withoutRecommendation).toEqual({
      selectedBookIds: ['livro-principal'],
      primaryBookId: 'livro-principal',
    });
  });

  it('exibe todos os Livros escolhidos em um único formulário obrigatório', () => {
    const books = [
      {
        id: 'livro-1',
        isbn: null,
        title: 'Primeiro Livro',
        author: 'Autora A',
        publisher: null,
        coverImageUrl: null,
        category: 'Ficção',
      },
      {
        id: 'livro-2',
        isbn: null,
        title: 'Segundo Livro',
        author: 'Autora B',
        publisher: null,
        coverImageUrl: null,
        category: 'Ficção',
      },
    ];
    const html = renderToStaticMarkup(
      <PublicRequestForm
        books={books}
        onCreated={vi.fn()}
        publicIdentifier={IDENTIFIER}
      />,
    );

    expect(html).toContain('Primeiro Livro');
    expect(html).toContain('Segundo Livro');
    expect(html.match(/name="bookId"/g)).toHaveLength(2);
    expect(html.match(/name="requesterName"/g)).toHaveLength(1);
    expect(html.match(/name="requesterPhone"/g)).toHaveLength(1);
    expect(html.match(/required=""/g)).toHaveLength(2);
  });

  it('oculta a seção sem recomendações', () => {
    const html = renderToStaticMarkup(
      <BookRecommendations onToggle={vi.fn()} recommendations={[]} />,
    );

    expect(html).toBe('');
  });

  it('exibe até três recomendações com capa, título, autor e justificativas', () => {
    const recommendations = ['Um', 'Dois', 'Três'].map((suffix, index) => ({
      book: {
        id: `livro-${index + 1}`,
        isbn: null,
        title: `Livro ${suffix}`,
        author: `Autora ${suffix}`,
        publisher: null,
        coverImageUrl: null,
        category: 'Romance',
      },
      score: 5,
      reasons: ['Mesma categoria'] as const,
    }));

    const html = renderToStaticMarkup(
      <BookRecommendations
        onToggle={vi.fn()}
        recommendations={recommendations}
      />,
    );

    expect(html).toContain('Você também pode gostar');
    expect(html.match(/Adicionar à seleção/g)).toHaveLength(3);
    expect(html.match(/Mesma categoria/g)).toHaveLength(3);
    expect(html).toContain('Capa indisponível de Livro Um');
    expect(html).toContain('Livro Três');
    expect(html).toContain('Autora Dois');
    expect(html).not.toContain('name="requesterName"');
  });

  it('adiciona e remove recomendações sem substituir o livro principal', () => {
    const onToggle = vi.fn();
    const recommendation = {
      book: {
        id: 'livro-recomendado',
        isbn: null,
        title: 'Livro recomendado',
        author: 'Autora',
        publisher: null,
        coverImageUrl: null,
        category: 'Romance',
      },
      score: 5,
      reasons: ['Mesma categoria'] as const,
    };
    const section = BookRecommendations({
      recommendations: [recommendation],
      onToggle,
      selectedBookIds: [],
    });

    findButton(section)?.();

    expect(onToggle).toHaveBeenCalledOnce();
    expect(onToggle).toHaveBeenCalledWith('livro-recomendado');

    const selectedHtml = renderToStaticMarkup(
      <BookRecommendations
        onToggle={onToggle}
        recommendations={[recommendation]}
        selectedBookIds={['livro-recomendado']}
      />,
    );
    expect(selectedHtml).toContain('Remover da seleção');
    expect(selectedHtml).toContain('aria-pressed="true"');
  });
});
