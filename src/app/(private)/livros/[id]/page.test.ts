import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getOwnBookById } from '@/services/books';

import BookDetailsPage from './page';

vi.mock('@/services/books', () => ({
  getOwnBookById: vi.fn(),
}));

const getOwnBookByIdMock = vi.mocked(getOwnBookById);
const BOOK_ID = '123e4567-e89b-42d3-a456-426614174000';

async function renderPage(id = BOOK_ID) {
  return renderToStaticMarkup(
    await BookDetailsPage({ params: Promise.resolve({ id }) }),
  );
}

describe('BookDetailsPage', () => {
  beforeEach(() => {
    getOwnBookByIdMock.mockReset();
  });

  it('consulta uma vez e apresenta somente os dados reais do Livro disponível', async () => {
    getOwnBookByIdMock.mockResolvedValue({
      status: 'success',
      book: {
        id: BOOK_ID,
        isbn: '9780000000001',
        title: 'Livro real',
        author: 'Autora real',
        publisher: 'Editora real',
        coverImageUrl: 'https://example.com/capa.jpg',
        status: 'disponivel',
      },
    });

    const html = await renderPage();

    expect(getOwnBookByIdMock).toHaveBeenCalledOnce();
    expect(getOwnBookByIdMock).toHaveBeenCalledWith(BOOK_ID);
    expect(html).toContain('Livro real');
    expect(html).toContain('Autora real');
    expect(html).toContain('9780000000001');
    expect(html).toContain('Editora real');
    expect(html).toContain('Disponível');
    expect(html).toContain('src="https://example.com/capa.jpg"');
    expect(html).toContain('alt="Capa de Livro real"');
    expect(html).toContain('href="/biblioteca"');
    expect(html).toContain(`href="/livros/${BOOK_ID}/editar"`);
    expect(html).toContain('Excluir livro');
    expect(html).not.toContain('O Senhor dos Anéis');
    expect(html).not.toContain('Descrição');
    expect(html).not.toContain('Categorias');
    expect(html).not.toContain('Atividades recentes');
    expect(html).not.toContain('Emprestar');
    expect(html).not.toContain('Devolver');
    expect(html).not.toContain('Solicitar empréstimo');
  });

  it('traduz a situação emprestado e trata opcionais e capa ausentes', async () => {
    getOwnBookByIdMock.mockResolvedValue({
      status: 'success',
      book: {
        id: BOOK_ID,
        isbn: null,
        title: 'Livro sem capa',
        author: 'Autor real',
        publisher: null,
        coverImageUrl: null,
        status: 'emprestado',
      },
    });

    const html = await renderPage();

    expect(html).toContain('Emprestado');
    expect(html.match(/Não informado/g)).toHaveLength(2);
    expect(html).toContain('Capa indisponível de Livro sem capa');
    expect(html).not.toContain('<img');
  });

  it.each(['invalid_id', 'not_found'] as const)(
    'usa a mesma mensagem segura para %s',
    async (status) => {
      getOwnBookByIdMock.mockResolvedValue({ status, book: null });

      const html = await renderPage('id-da-rota');

      expect(getOwnBookByIdMock).toHaveBeenCalledOnce();
      expect(html).toContain('Livro não encontrado.');
      expect(html).toContain('href="/biblioteca"');
      expect(html).not.toContain(status);
      expect(html).not.toContain('unavailable');
    },
  );

  it('apresenta mensagem genérica para falha técnica', async () => {
    getOwnBookByIdMock.mockResolvedValue({
      status: 'error',
      category: 'unavailable',
    });

    const html = await renderPage();

    expect(html).toContain(
      'Não foi possível carregar o livro. Tente novamente.',
    );
    expect(html).toContain('href="/biblioteca"');
    expect(html).not.toContain('unavailable');
  });
});
