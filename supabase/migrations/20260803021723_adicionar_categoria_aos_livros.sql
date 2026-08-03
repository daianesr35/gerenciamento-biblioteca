alter table public.livros
  add column categoria text null,
  add constraint livros_categoria_nao_vazia
    check (categoria is null or btrim(categoria) <> '');

drop function public.listar_livros_publicos(uuid);

create function public.listar_livros_publicos(
  p_identificador_publico uuid
)
returns table (
  id uuid,
  isbn text,
  titulo text,
  autor text,
  editora text,
  imagem_capa text,
  categoria text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    livros.id,
    livros.isbn,
    livros.titulo,
    livros.autor,
    livros.editora,
    livros.imagem_capa,
    livros.categoria
  from public.livros
  join public.bibliotecas
    on bibliotecas.id = livros.biblioteca_id
  where bibliotecas.identificador_publico = p_identificador_publico
    and livros.situacao = 'disponivel';
$$;

revoke all
  on function public.listar_livros_publicos(uuid)
  from public, anon, authenticated;

grant execute
  on function public.listar_livros_publicos(uuid)
  to anon;
