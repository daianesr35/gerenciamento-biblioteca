create table public.solicitacoes (
  id uuid primary key default gen_random_uuid(),
  livro_id uuid not null,
  nome_solicitante text not null,
  telefone_solicitante text not null,
  data_solicitacao timestamptz not null default now(),
  status text not null default 'pendente',
  constraint solicitacoes_id_livro_unico
    unique (id, livro_id),
  constraint solicitacoes_nome_solicitante_nao_vazio
    check (btrim(nome_solicitante) <> ''),
  constraint solicitacoes_telefone_solicitante_nao_vazio
    check (btrim(telefone_solicitante) <> ''),
  constraint solicitacoes_status_valido
    check (status in ('pendente', 'confirmada', 'recusada')),
  constraint solicitacoes_livro_fk
    foreign key (livro_id)
    references public.livros (id)
    on delete restrict
);

create index solicitacoes_livro_id_idx
  on public.solicitacoes (livro_id);

create table public.emprestimos (
  id uuid primary key default gen_random_uuid(),
  livro_id uuid not null,
  solicitacao_id uuid,
  nome_solicitante text not null,
  telefone_solicitante text not null,
  data_emprestimo timestamptz not null default now(),
  data_devolucao timestamptz,
  constraint emprestimos_solicitacao_unica
    unique (solicitacao_id, livro_id),
  constraint emprestimos_nome_solicitante_nao_vazio
    check (btrim(nome_solicitante) <> ''),
  constraint emprestimos_telefone_solicitante_nao_vazio
    check (btrim(telefone_solicitante) <> ''),
  constraint emprestimos_datas_validas
    check (
      data_devolucao is null
      or data_devolucao >= data_emprestimo
    ),
  constraint emprestimos_livro_fk
    foreign key (livro_id)
    references public.livros (id)
    on delete restrict,
  constraint emprestimos_solicitacao_livro_fk
    foreign key (solicitacao_id, livro_id)
    references public.solicitacoes (id, livro_id)
    on delete restrict
);

create index emprestimos_livro_id_idx
  on public.emprestimos (livro_id);
