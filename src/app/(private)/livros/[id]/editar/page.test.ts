import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getOwnBookById } from '@/services/books';

import EditBookPage from './page';

vi.mock('@/services/books', () => ({ getOwnBookById: vi.fn() }));

const getOwnBookByIdMock = vi.mocked(getOwnBookById);
const BOOK_ID = '123e4567-e89b-42d3-a456-426614174000';

async function renderPage(id = BOOK_ID) {
  return renderToStaticMarkup(
    await EditBookPage({ params: Promise.resolve({ id }) }),
  );
}

describe('página de edição de Livro', () => {
  beforeEach(() => getOwnBookByIdMock.mockReset());

  it('consulta uma vez e preenche os seis campos reais', async () => {
    getOwnBookByIdMock.mockResolvedValue({
      status: 'success',
      book: {
        id: BOOK_ID,
        title: 'Livro real',
        author: 'Autora real',
        isbn: '123',
        publisher: 'Editora real',
        coverImageUrl: 'https://example.com/capa.jpg',
        category: 'Ficção científica',
        status: 'disponivel',
      },
    });

    const html = await renderPage();

    expect(getOwnBookByIdMock).toHaveBeenCalledOnce();
    expect(getOwnBookByIdMock).toHaveBeenCalledWith(BOOK_ID);
    expect(html).toContain('name="title"');
    expect(html).toContain('value="Livro real"');
    expect(html).toContain('value="Autora real"');
    expect(html).toContain('value="123"');
    expect(html).toContain('value="Editora real"');
    expect(html).toContain('value="https://example.com/capa.jpg"');
    expect(html).toContain('name="category"');
    expect(html).toContain('value="Ficção científica"');
    expect(html).not.toContain('name="situacao"');
    expect(html).not.toContain('name="biblioteca_id"');
    expect(html).not.toContain('Excluir');
  });

  it('representa opcionais nulos como campos vazios', async () => {
    getOwnBookByIdMock.mockResolvedValue({
      status: 'success',
      book: {
        id: BOOK_ID,
        title: 'Livro',
        author: 'Autora',
        isbn: null,
        publisher: null,
        coverImageUrl: null,
        category: null,
        status: 'disponivel',
      },
    });

    const html = await renderPage();

    expect(html.match(/value=""/g)).toHaveLength(4);
  });

  it.each(['invalid_id', 'not_found'] as const)(
    'usa estado seguro para %s',
    async (status) => {
      getOwnBookByIdMock.mockResolvedValue({ status, book: null });
      const html = await renderPage('id-da-rota');
      expect(html).toContain('Livro não encontrado.');
      expect(html).toContain('href="/biblioteca"');
      expect(html).not.toContain('<form');
    },
  );

  it('usa mensagem genérica para falha técnica', async () => {
    getOwnBookByIdMock.mockResolvedValue({
      status: 'error',
      category: 'unavailable',
    });
    const html = await renderPage();
    expect(html).toContain(
      'Não foi possível carregar o livro. Tente novamente.',
    );
    expect(html).not.toContain('<form');
  });
});
