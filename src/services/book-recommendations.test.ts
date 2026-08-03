import { describe, expect, it } from 'vitest';

import type { Book } from '@/types/books';
import type { PublicBook } from '@/types/public-library';

import { recommendBooks } from './book-recommendations';

const SELECTED: PublicBook = {
  id: 'selected',
  isbn: null,
  title: 'A Jornada do Reino Perdido',
  author: 'José da Silva',
  publisher: 'Editora Árvore',
  coverImageUrl: null,
  category: 'Fantasia',
};

function book(id: string, overrides: Partial<PublicBook> = {}): PublicBook {
  return {
    ...SELECTED,
    id,
    title: `Livro ${id}`,
    author: `Autor ${id}`,
    publisher: `Editora ${id}`,
    category: `Categoria ${id}`,
    ...overrides,
  };
}

describe('pontuação e justificativas', () => {
  it('atribui +5 somente para a mesma categoria', () => {
    expect(
      recommendBooks(SELECTED, [book('1', { category: 'Fantasia' })]),
    ).toEqual([
      expect.objectContaining({ score: 5, reasons: ['Mesma categoria'] }),
    ]);
  });

  it.each([
    ['Fiction', 'Ficção'],
    ['Science Fiction', 'Ficção científica'],
    ['History', 'História'],
  ])(
    'reconhece categorias equivalentes em inglês e português',
    (left, right) => {
      const selected = { ...SELECTED, category: left };

      expect(
        recommendBooks(selected, [book('1', { category: right })]),
      ).toEqual([
        expect.objectContaining({ score: 5, reasons: ['Mesma categoria'] }),
      ]);
    },
  );

  it('normaliza caixa, acentos e espaços nas categorias equivalentes', () => {
    expect(
      recommendBooks({ ...SELECTED, category: '  SCIENCE FICTION  ' }, [
        book('1', { category: ' ficcao CIENTÍFICA ' }),
      ])[0],
    ).toMatchObject({ score: 5, reasons: ['Mesma categoria'] });
  });

  it('não pontua categorias que não são equivalentes', () => {
    expect(
      recommendBooks({ ...SELECTED, category: 'Fiction' }, [
        book('1', { category: 'História' }),
      ]),
    ).toEqual([]);
  });

  it('atribui +4 somente para o mesmo autor', () => {
    expect(
      recommendBooks(SELECTED, [book('1', { author: 'José da Silva' })]),
    ).toEqual([
      expect.objectContaining({ score: 4, reasons: ['Mesmo autor'] }),
    ]);
  });

  it('descarta a mesma editora sozinha por somar apenas +2', () => {
    expect(
      recommendBooks(SELECTED, [book('1', { publisher: 'Editora Árvore' })]),
    ).toEqual([]);
  });

  it('conta +1 por palavra relevante comum e usa uma única justificativa', () => {
    const selected = { ...SELECTED, title: 'Jornada Reino Perdido Crônicas' };
    const result = recommendBooks(selected, [
      book('1', { title: 'Crônicas: Perdido, Reino e Jornada' }),
    ]);

    expect(result[0]).toMatchObject({
      score: 4,
      reasons: ['Título semelhante'],
    });
  });

  it('permite que palavras do título completem a pontuação mínima', () => {
    expect(
      recommendBooks(SELECTED, [
        book('1', {
          publisher: 'Editora Árvore',
          title: 'Jornada pelo Reino',
        }),
      ]),
    ).toEqual([
      expect.objectContaining({
        score: 4,
        reasons: ['Mesma editora', 'Título semelhante'],
      }),
    ]);
  });

  it('soma categoria e autor', () => {
    expect(
      recommendBooks(SELECTED, [
        book('1', { category: 'Fantasia', author: 'José da Silva' }),
      ])[0],
    ).toMatchObject({ score: 9, reasons: ['Mesma categoria', 'Mesmo autor'] });
  });

  it('soma autor e editora', () => {
    expect(
      recommendBooks(SELECTED, [
        book('1', { author: 'José da Silva', publisher: 'Editora Árvore' }),
      ])[0],
    ).toMatchObject({ score: 6, reasons: ['Mesmo autor', 'Mesma editora'] });
  });

  it('retorna todas e somente as justificativas pontuadas', () => {
    expect(
      recommendBooks(SELECTED, [
        book('1', {
          title: 'Reino Perdido',
          author: 'José da Silva',
          publisher: 'Editora Árvore',
          category: 'Fantasia',
        }),
      ])[0],
    ).toMatchObject({
      score: 13,
      reasons: [
        'Mesma categoria',
        'Mesmo autor',
        'Mesma editora',
        'Título semelhante',
      ],
    });
  });
});

describe('normalização', () => {
  it('ignora caixa, espaços externos e acentos nos campos', () => {
    expect(
      recommendBooks(SELECTED, [
        book('1', {
          category: '  FANTASIA ',
          author: ' jose da silva ',
          publisher: ' editora arvore ',
        }),
      ])[0],
    ).toMatchObject({ score: 11 });
  });

  it('ignora pontuação, acentos, palavras funcionais e repetições no título', () => {
    expect(
      recommendBooks(SELECTED, [
        book('1', {
          title: 'JORNADA, jornada: do REINO!',
          publisher: 'Editora Árvore',
        }),
      ])[0],
    ).toMatchObject({
      score: 4,
      reasons: ['Mesma editora', 'Título semelhante'],
    });
  });

  it('não considera valores nulos ou vazios como correspondência', () => {
    const selected = { ...SELECTED, category: null, publisher: '   ' };
    expect(
      recommendBooks(selected, [
        book('1', { category: null, publisher: '', title: 'Sem relação' }),
      ]),
    ).toEqual([]);
  });
});

describe('exclusões e resultados vazios', () => {
  it('exclui o próprio livro e não usa dados fora da coleção recebida', () => {
    expect(recommendBooks(SELECTED, [{ ...SELECTED }])).toEqual([]);
  });

  it('exclui outra cópia da obra selecionada por ISBN ou título e autor', () => {
    const selectedWithIsbn = { ...SELECTED, isbn: '978-85-00000-00-1' };

    expect(
      recommendBooks(selectedWithIsbn, [
        book('isbn-duplicado', {
          isbn: '9788500000001',
          category: 'Fantasia',
        }),
        book('titulo-duplicado', {
          title: '  A JORNADA DO REINO PERDIDO ',
          author: 'Jose da Silva',
          category: 'Fantasia',
        }),
      ]),
    ).toEqual([]);
  });

  it('mantém somente uma cópia quando os candidatos repetem a mesma obra', () => {
    const result = recommendBooks(SELECTED, [
      book('primeira-copia', {
        isbn: '978-85-11111-11-1',
        title: 'Outra obra',
        category: 'Fantasia',
      }),
      book('segunda-copia', {
        isbn: '9788511111111',
        title: 'Outra obra',
        category: 'Fantasia',
      }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]?.book.id).toBe('primeira-copia');
  });

  it('preserva Livros diferentes e aplica o limite após deduplicar', () => {
    const candidates = [
      book('duplicado-1', {
        isbn: '978-85-11111-11-1',
        title: 'Obra repetida',
        category: 'Fantasia',
      }),
      book('duplicado-2', {
        isbn: '9788511111111',
        title: 'Obra repetida',
        category: 'Fantasia',
      }),
      book('diferente-1', { title: 'Obra A', category: 'Fantasia' }),
      book('diferente-2', { title: 'Obra B', category: 'Fantasia' }),
      book('diferente-3', { title: 'Obra C', category: 'Fantasia' }),
    ];
    const result = recommendBooks(SELECTED, candidates);

    expect(result).toHaveLength(3);
    expect(result).toEqual(recommendBooks(SELECTED, candidates));
    expect(
      result.some(({ book: candidate }) => candidate.id === 'duplicado-2'),
    ).toBe(false);
    expect(
      result.some(({ book: candidate }) => candidate.id === 'diferente-1'),
    ).toBe(true);
  });

  it('ignora candidato abaixo da pontuação mínima', () => {
    expect(recommendBooks(SELECTED, [book('1', { title: 'Reino' })])).toEqual(
      [],
    );
  });

  it('ignora candidato indisponível quando o tipo fornece status', () => {
    const unavailable: Book = {
      ...book('1', { category: 'Fantasia' }),
      status: 'emprestado',
    };
    expect(recommendBooks(SELECTED, [unavailable])).toEqual([]);
  });

  it.each([
    ['coleção vazia', []],
    ['nenhuma similaridade suficiente', [book('1')]],
  ])('retorna vazio para %s', (_case, candidates) => {
    expect(recommendBooks(SELECTED, candidates)).toEqual([]);
  });
});

describe('ordenação determinística e limite', () => {
  it('ordena por pontuação decrescente', () => {
    const result = recommendBooks(SELECTED, [
      book('autor', { author: 'José da Silva' }),
      book('categoria', { category: 'Fantasia' }),
    ]);
    expect(result.map(({ book: candidate }) => candidate.id)).toEqual([
      'categoria',
      'autor',
    ]);
  });

  it('desempata por título normalizado e depois por ID', () => {
    const result = recommendBooks(SELECTED, [
      book('b', { title: 'Zeta', category: 'Fantasia' }),
      book('c', {
        title: '  Árvore ',
        author: 'Autora C',
        category: 'Fantasia',
      }),
      book('a', {
        title: 'arvore',
        author: 'Autora A',
        category: 'Fantasia',
      }),
    ]);
    expect(result.map(({ book: candidate }) => candidate.id)).toEqual([
      'a',
      'c',
      'b',
    ]);
  });

  it('é determinístico, não altera a entrada e limita a três resultados', () => {
    const candidates = ['4', '2', '3', '1'].map((id) =>
      book(id, { category: 'Fantasia' }),
    );
    const originalOrder = candidates.map(({ id }) => id);

    expect(recommendBooks(SELECTED, candidates)).toEqual(
      recommendBooks(SELECTED, candidates),
    );
    expect(recommendBooks(SELECTED, candidates)).toHaveLength(3);
    expect(candidates.map(({ id }) => id)).toEqual(originalOrder);
  });
});
