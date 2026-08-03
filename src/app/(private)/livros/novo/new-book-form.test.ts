import { describe, expect, it } from 'vitest';

import type { GoogleBooksLookupResult } from '@/types/google-books';

import { mergeBookValues, type NewBookFormValues } from './new-book-form';

const filledForm: NewBookFormValues = {
  title: 'Título digitado',
  author: 'Autor digitado',
  isbn: '978-85-359-3278-6',
  publisher: 'Editora digitada',
  coverImageUrl: 'https://example.com/capa-digitada.jpg',
  category: 'Categoria digitada',
};

function success(
  book: Partial<NewBookFormValues> = {},
): GoogleBooksLookupResult {
  return {
    status: 'success',
    book: {
      title: 'Título encontrado',
      author: 'Autor encontrado',
      isbn: '9788535932786',
      publisher: 'Editora encontrada',
      coverImageUrl: 'https://example.com/capa-encontrada.jpg',
      category: 'Ficção científica',
      ...book,
    },
  };
}

describe('preenchimento do formulário pela consulta ISBN', () => {
  it('preenche os seis campos retornados', () => {
    expect(mergeBookValues(filledForm, success())).toEqual({
      title: 'Título encontrado',
      author: 'Autor encontrado',
      isbn: '9788535932786',
      publisher: 'Editora encontrada',
      coverImageUrl: 'https://example.com/capa-encontrada.jpg',
      category: 'Ficção científica',
    });
  });

  it('não apaga campos preenchidos quando a API retorna valores vazios', () => {
    expect(
      mergeBookValues(
        filledForm,
        success({
          author: '',
          publisher: '',
          coverImageUrl: '',
          category: '',
        }),
      ),
    ).toEqual({
      ...filledForm,
      title: 'Título encontrado',
      isbn: '9788535932786',
    });
  });

  it.each<GoogleBooksLookupResult>([
    {
      status: 'invalid',
      message: 'Informe um ISBN com 10 ou 13 caracteres.',
    },
    {
      status: 'not_found',
      message: 'Livro não encontrado para o ISBN informado.',
    },
    {
      status: 'error',
      category: 'timeout',
      message: 'A consulta demorou mais que o esperado. Tente novamente.',
    },
    {
      status: 'error',
      category: 'unavailable',
      message: 'Não foi possível consultar o livro. Tente novamente.',
    },
  ])('preserva o cadastro manual no resultado $status', (result) => {
    expect(mergeBookValues(filledForm, result)).toBe(filledForm);
  });
});
