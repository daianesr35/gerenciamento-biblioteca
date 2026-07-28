create table public.livros (
  id uuid primary key default gen_random_uuid(),
  biblioteca_id uuid not null,
  isbn text,
  titulo text not null,
  autor text not null,
  editora text,
  imagem_capa text,
  situacao text not null default 'disponivel',
  constraint livros_isbn_nao_vazio
    check (isbn is null or btrim(isbn) <> ''),
  constraint livros_titulo_nao_vazio
    check (btrim(titulo) <> ''),
  constraint livros_autor_nao_vazio
    check (btrim(autor) <> ''),
  constraint livros_editora_nao_vazia
    check (editora is null or btrim(editora) <> ''),
  constraint livros_imagem_capa_nao_vazia
    check (imagem_capa is null or btrim(imagem_capa) <> ''),
  constraint livros_situacao_valida
    check (situacao in ('disponivel', 'emprestado')),
  constraint livros_biblioteca_fk
    foreign key (biblioteca_id)
    references public.bibliotecas (id)
    on delete restrict
);

create index livros_biblioteca_id_idx
  on public.livros (biblioteca_id);
