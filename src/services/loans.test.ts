import { describe, expect, it, vi } from 'vitest';

import { createDirectLoan, listOwnLoans, registerLoanReturn } from './loans';

const ID = '123e4567-e89b-42d3-a456-426614174000';

describe('Service de empréstimos', () => {
  it('mapeia empréstimos e livros disponíveis', async () => {
    const result = await listOwnLoans(
      vi.fn().mockResolvedValue([
        {
          id: ID,
          livro_id: ID,
          nome_solicitante: 'Ana',
          telefone_solicitante: '1199',
          data_emprestimo: '2026-07-30T12:00:00Z',
          data_devolucao: null,
          livros: {
            titulo: 'Livro real',
            imagem_capa: 'https://example.com/capa.jpg',
          },
        },
      ]),
      vi.fn().mockResolvedValue([{ id: ID, titulo: 'Disponível' }]),
    );
    expect(result).toMatchObject({
      status: 'success',
      loans: [
        {
          bookTitle: 'Livro real',
          bookCoverImageUrl: 'https://example.com/capa.jpg',
          status: 'Emprestado',
        },
      ],
      availableBooks: [{ title: 'Disponível' }],
    });
  });

  it('valida e normaliza o empréstimo direto', async () => {
    const create = vi.fn();
    await expect(createDirectLoan('', '', '', create)).resolves.toMatchObject({
      status: 'invalid',
    });
    await createDirectLoan(ID, ' Ana ', ' 1199 ', create);
    expect(create).toHaveBeenCalledWith(ID, 'Ana', '1199');
  });

  it('categoriza indisponibilidade e impede devolução inválida', async () => {
    await expect(
      createDirectLoan(
        ID,
        'Ana',
        '1199',
        vi.fn().mockRejectedValue({ code: 'book_unavailable' }),
      ),
    ).resolves.toEqual({ status: 'error', category: 'book_unavailable' });
    await expect(registerLoanReturn('inválido')).resolves.toEqual({
      status: 'error',
      category: 'invalid_loan',
    });
  });
});
