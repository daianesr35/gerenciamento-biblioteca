import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { listOwnBooks } from '@/services/books';

import LibraryPage from './page';

vi.mock('@/services/books', () => ({
  listOwnBooks: vi.fn(),
}));

const listOwnBooksMock = vi.mocked(listOwnBooks);

describe('LibraryPage', () => {
  beforeEach(() => {
    listOwnBooksMock.mockReset();
  });

  it('renderiza os livros reais na ordem recebida, com situações, capas e links', async () => {
    listOwnBooksMock.mockResolvedValue({
      status: 'success',
      books: [
        {
          id: 'livro-real-1',
          isbn: null,
          title: 'Livro real disponível',
          author: 'Autora real',
          publisher: null,
          coverImageUrl: 'https://example.com/capa.jpg',
          status: 'disponivel',
        },
        {
          id: 'livro-real-2',
          isbn: null,
          title: 'Livro real emprestado',
          author: 'Outro autor',
          publisher: null,
          coverImageUrl: null,
          status: 'emprestado',
        },
      ],
    });

    const html = renderToStaticMarkup(await LibraryPage());

    expect(listOwnBooksMock).toHaveBeenCalledOnce();
    expect(html.indexOf('Livro real disponível')).toBeLessThan(
      html.indexOf('Livro real emprestado'),
    );
    expect(html).toContain('Autora real');
    expect(html).toContain('Disponível');
    expect(html).toContain('Emprestado');
    expect(html).toContain('src="https://example.com/capa.jpg"');
    expect(html).toContain('Capa indisponível de Livro real emprestado');
    expect(html).toContain('href="/livros/livro-real-1"');
    expect(html).toContain('href="/livros/livro-real-1/editar"');
    expect(html).not.toContain('O Senhor dos Anéis');
    expect(html).not.toContain('Buscar por título');
    expect(html).not.toContain('Filtros');
    expect(html).not.toContain('Ordenar por');
    expect(html).not.toContain('Total de livros');
    expect(html).not.toContain('Mostrando 1 a');
    expect(html).not.toContain('Mais ações');
  });

  it('trata a lista vazia como sucesso e oferece o cadastro', async () => {
    listOwnBooksMock.mockResolvedValue({ status: 'success', books: [] });

    const html = renderToStaticMarkup(await LibraryPage());

    expect(html).toContain('Ainda não há livros cadastrados');
    expect(html).toContain('href="/livros/novo"');
    expect(html).not.toContain('Não foi possível carregar os livros');
  });

  it('apresenta uma mensagem segura quando a listagem falha', async () => {
    listOwnBooksMock.mockResolvedValue({
      status: 'error',
      category: 'unavailable',
    });

    const html = renderToStaticMarkup(await LibraryPage());

    expect(html).toContain('Não foi possível carregar os livros');
    expect(html).toContain('Tente novamente.');
    expect(html).toContain('href="/livros/novo"');
    expect(html).not.toContain('unavailable');
  });
});
