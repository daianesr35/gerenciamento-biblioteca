import { beforeEach, describe, expect, it, vi } from 'vitest';

const createClient = vi.hoisted(() => vi.fn());
const getSupabaseEnvironment = vi.hoisted(() => vi.fn());

vi.mock('@supabase/supabase-js', () => ({ createClient }));
vi.mock('@/config/env', () => ({ getSupabaseEnvironment }));

import {
  createPublicLoanRequest,
  createPublicSupabaseClient,
  getPublicOwnerName,
  listPublicBookRows,
  locatePublicLibrary,
} from './public';

const IDENTIFIER = '123e4567-e89b-42d3-a456-426614174000';

beforeEach(() => {
  createClient.mockReset();
  getSupabaseEnvironment.mockReset();
  getSupabaseEnvironment.mockReturnValue({
    supabaseUrl: 'https://project.supabase.co',
    supabasePublishableKey: 'publishable-key',
  });
});

describe('cliente Supabase público', () => {
  it('usa somente credenciais públicas e desativa qualquer sessão persistida', () => {
    const client = { rpc: vi.fn() };
    createClient.mockReturnValue(client);

    expect(createPublicSupabaseClient()).toBe(client);
    expect(createClient).toHaveBeenCalledWith(
      'https://project.supabase.co',
      'publishable-key',
      {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
      },
    );
  });
});

describe('adaptador das RPCs públicas', () => {
  it('localiza a Biblioteca e lista os Livros com o parâmetro esperado', async () => {
    const row = {
      id: 'livro-1',
      isbn: null,
      titulo: 'Livro',
      autor: 'Autora',
      editora: null,
      imagem_capa: null,
    };
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({ data: true, error: null })
      .mockResolvedValueOnce({ data: [row], error: null });
    createClient.mockReturnValue({ rpc });

    await expect(locatePublicLibrary(IDENTIFIER)).resolves.toBe(true);
    await expect(listPublicBookRows(IDENTIFIER)).resolves.toEqual([row]);
    expect(rpc).toHaveBeenNthCalledWith(1, 'localizar_biblioteca_publica', {
      p_identificador_publico: IDENTIFIER,
    });
    expect(rpc).toHaveBeenNthCalledWith(2, 'listar_livros_publicos', {
      p_identificador_publico: IDENTIFIER,
    });
  });

  it('obtém somente o nome público do Proprietário', async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({ data: 'Maria da Silva', error: null })
      .mockResolvedValueOnce({ data: null, error: null });
    createClient.mockReturnValue({ rpc });

    await expect(getPublicOwnerName(IDENTIFIER)).resolves.toBe(
      'Maria da Silva',
    );
    await expect(getPublicOwnerName(IDENTIFIER)).resolves.toBeNull();
    expect(rpc).toHaveBeenCalledWith('obter_nome_proprietario_publico', {
      p_identificador_publico: IDENTIFIER,
    });
  });

  it('aceita catálogo vazio e normaliza erros sem expor o Supabase', async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({
        data: null,
        error: new Error('detalhe interno'),
      })
      .mockResolvedValueOnce({
        data: null,
        error: new Error('detalhe interno'),
      });
    createClient.mockReturnValue({ rpc });

    await expect(listPublicBookRows(IDENTIFIER)).resolves.toEqual([]);
    await expect(locatePublicLibrary(IDENTIFIER)).rejects.toEqual({
      code: 'public_library_unavailable',
    });
    await expect(listPublicBookRows(IDENTIFIER)).rejects.toEqual({
      code: 'public_books_unavailable',
    });
  });

  it('cria a solicitação exclusivamente pela RPC pública existente', async () => {
    const rpc = vi
      .fn()
      .mockResolvedValue({ data: 'solicitacao-1', error: null });
    createClient.mockReturnValue({ rpc });

    await expect(
      createPublicLoanRequest({
        publicIdentifier: IDENTIFIER,
        bookId: '223e4567-e89b-42d3-a456-426614174000',
        requesterName: 'Ana',
        requesterPhone: '11999990000',
      }),
    ).resolves.toEqual({ requestId: 'solicitacao-1' });
    expect(rpc).toHaveBeenCalledWith('criar_solicitacao_publica', {
      p_identificador_publico: IDENTIFIER,
      p_livro_id: '223e4567-e89b-42d3-a456-426614174000',
      p_nome_solicitante: 'Ana',
      p_telefone_solicitante: '11999990000',
    });
  });

  it('classifica livro indisponível e oculta outras falhas da RPC', async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: { code: 'P0001' } })
      .mockResolvedValueOnce({
        data: null,
        error: { code: '500', message: 'detalhe interno' },
      });
    createClient.mockReturnValue({ rpc });
    const input = {
      publicIdentifier: IDENTIFIER,
      bookId: '223e4567-e89b-42d3-a456-426614174000',
      requesterName: 'Ana',
      requesterPhone: '11999990000',
    };

    await expect(createPublicLoanRequest(input)).rejects.toEqual({
      code: 'book_unavailable',
    });
    await expect(createPublicLoanRequest(input)).rejects.toEqual({
      code: 'request_unavailable',
    });
  });
});
