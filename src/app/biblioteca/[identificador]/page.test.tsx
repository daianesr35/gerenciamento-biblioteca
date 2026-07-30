import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getPublicLibrary } from '@/services/public-library';

import PublicLibraryPage from './page';
import { filterPublicBooks, PublicCatalog } from './public-catalog';

vi.mock('@/services/public-library', () => ({
  getPublicLibrary: vi.fn(),
}));

const getPublicLibraryMock = vi.mocked(getPublicLibrary);
const IDENTIFIER = '123e4567-e89b-42d3-a456-426614174000';

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
          },
        ]}
        publicIdentifier={IDENTIFIER}
      />,
    );

    expect(html).toContain('Solicitar');
    expect(html).not.toContain('name="requesterName"');
    expect(html).not.toContain('name="requesterPhone"');
  });
});
