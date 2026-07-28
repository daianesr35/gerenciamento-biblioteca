alter table public.proprietarios
  add column usuario_auth_id uuid not null,
  add constraint proprietarios_usuario_auth_unico
    unique (usuario_auth_id),
  add constraint proprietarios_usuario_auth_fk
    foreign key (usuario_auth_id)
    references auth.users (id)
    on delete restrict;

alter table public.proprietarios enable row level security;
alter table public.bibliotecas enable row level security;
alter table public.livros enable row level security;
alter table public.solicitacoes enable row level security;
alter table public.emprestimos enable row level security;

revoke all on table public.proprietarios from anon, authenticated;
revoke all on table public.bibliotecas from anon, authenticated;
revoke all on table public.livros from anon, authenticated;
revoke all on table public.solicitacoes from anon, authenticated;
revoke all on table public.emprestimos from anon, authenticated;

grant select, insert, update, delete
  on table public.proprietarios
  to authenticated;
grant select, insert, update, delete
  on table public.bibliotecas
  to authenticated;
grant select, insert, update, delete
  on table public.livros
  to authenticated;
grant select, insert, update, delete
  on table public.solicitacoes
  to authenticated;
grant select, insert, update, delete
  on table public.emprestimos
  to authenticated;

create policy proprietarios_select_proprio
  on public.proprietarios
  for select
  to authenticated
  using (usuario_auth_id = (select auth.uid()));

create policy proprietarios_insert_proprio
  on public.proprietarios
  for insert
  to authenticated
  with check (usuario_auth_id = (select auth.uid()));

create policy proprietarios_update_proprio
  on public.proprietarios
  for update
  to authenticated
  using (usuario_auth_id = (select auth.uid()))
  with check (usuario_auth_id = (select auth.uid()));

create policy proprietarios_delete_proprio
  on public.proprietarios
  for delete
  to authenticated
  using (usuario_auth_id = (select auth.uid()));

create policy bibliotecas_select_propria
  on public.bibliotecas
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.proprietarios
      where proprietarios.id = bibliotecas.proprietario_id
        and proprietarios.usuario_auth_id = (select auth.uid())
    )
  );

create policy bibliotecas_insert_propria
  on public.bibliotecas
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.proprietarios
      where proprietarios.id = bibliotecas.proprietario_id
        and proprietarios.usuario_auth_id = (select auth.uid())
    )
  );

create policy bibliotecas_update_propria
  on public.bibliotecas
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.proprietarios
      where proprietarios.id = bibliotecas.proprietario_id
        and proprietarios.usuario_auth_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.proprietarios
      where proprietarios.id = bibliotecas.proprietario_id
        and proprietarios.usuario_auth_id = (select auth.uid())
    )
  );

create policy bibliotecas_delete_propria
  on public.bibliotecas
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.proprietarios
      where proprietarios.id = bibliotecas.proprietario_id
        and proprietarios.usuario_auth_id = (select auth.uid())
    )
  );

create policy livros_select_proprios
  on public.livros
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.bibliotecas
      join public.proprietarios
        on proprietarios.id = bibliotecas.proprietario_id
      where bibliotecas.id = livros.biblioteca_id
        and proprietarios.usuario_auth_id = (select auth.uid())
    )
  );

create policy livros_insert_proprios
  on public.livros
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.bibliotecas
      join public.proprietarios
        on proprietarios.id = bibliotecas.proprietario_id
      where bibliotecas.id = livros.biblioteca_id
        and proprietarios.usuario_auth_id = (select auth.uid())
    )
  );

create policy livros_update_proprios
  on public.livros
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.bibliotecas
      join public.proprietarios
        on proprietarios.id = bibliotecas.proprietario_id
      where bibliotecas.id = livros.biblioteca_id
        and proprietarios.usuario_auth_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.bibliotecas
      join public.proprietarios
        on proprietarios.id = bibliotecas.proprietario_id
      where bibliotecas.id = livros.biblioteca_id
        and proprietarios.usuario_auth_id = (select auth.uid())
    )
  );

create policy livros_delete_proprios
  on public.livros
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.bibliotecas
      join public.proprietarios
        on proprietarios.id = bibliotecas.proprietario_id
      where bibliotecas.id = livros.biblioteca_id
        and proprietarios.usuario_auth_id = (select auth.uid())
    )
  );

create policy solicitacoes_select_proprias
  on public.solicitacoes
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.livros
      join public.bibliotecas
        on bibliotecas.id = livros.biblioteca_id
      join public.proprietarios
        on proprietarios.id = bibliotecas.proprietario_id
      where livros.id = solicitacoes.livro_id
        and proprietarios.usuario_auth_id = (select auth.uid())
    )
  );

create policy solicitacoes_insert_proprias
  on public.solicitacoes
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.livros
      join public.bibliotecas
        on bibliotecas.id = livros.biblioteca_id
      join public.proprietarios
        on proprietarios.id = bibliotecas.proprietario_id
      where livros.id = solicitacoes.livro_id
        and proprietarios.usuario_auth_id = (select auth.uid())
    )
  );

create policy solicitacoes_update_proprias
  on public.solicitacoes
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.livros
      join public.bibliotecas
        on bibliotecas.id = livros.biblioteca_id
      join public.proprietarios
        on proprietarios.id = bibliotecas.proprietario_id
      where livros.id = solicitacoes.livro_id
        and proprietarios.usuario_auth_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.livros
      join public.bibliotecas
        on bibliotecas.id = livros.biblioteca_id
      join public.proprietarios
        on proprietarios.id = bibliotecas.proprietario_id
      where livros.id = solicitacoes.livro_id
        and proprietarios.usuario_auth_id = (select auth.uid())
    )
  );

create policy solicitacoes_delete_proprias
  on public.solicitacoes
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.livros
      join public.bibliotecas
        on bibliotecas.id = livros.biblioteca_id
      join public.proprietarios
        on proprietarios.id = bibliotecas.proprietario_id
      where livros.id = solicitacoes.livro_id
        and proprietarios.usuario_auth_id = (select auth.uid())
    )
  );

create policy emprestimos_select_proprios
  on public.emprestimos
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.livros
      join public.bibliotecas
        on bibliotecas.id = livros.biblioteca_id
      join public.proprietarios
        on proprietarios.id = bibliotecas.proprietario_id
      where livros.id = emprestimos.livro_id
        and proprietarios.usuario_auth_id = (select auth.uid())
    )
  );

create policy emprestimos_insert_proprios
  on public.emprestimos
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.livros
      join public.bibliotecas
        on bibliotecas.id = livros.biblioteca_id
      join public.proprietarios
        on proprietarios.id = bibliotecas.proprietario_id
      where livros.id = emprestimos.livro_id
        and proprietarios.usuario_auth_id = (select auth.uid())
    )
  );

create policy emprestimos_update_proprios
  on public.emprestimos
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.livros
      join public.bibliotecas
        on bibliotecas.id = livros.biblioteca_id
      join public.proprietarios
        on proprietarios.id = bibliotecas.proprietario_id
      where livros.id = emprestimos.livro_id
        and proprietarios.usuario_auth_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.livros
      join public.bibliotecas
        on bibliotecas.id = livros.biblioteca_id
      join public.proprietarios
        on proprietarios.id = bibliotecas.proprietario_id
      where livros.id = emprestimos.livro_id
        and proprietarios.usuario_auth_id = (select auth.uid())
    )
  );

create policy emprestimos_delete_proprios
  on public.emprestimos
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.livros
      join public.bibliotecas
        on bibliotecas.id = livros.biblioteca_id
      join public.proprietarios
        on proprietarios.id = bibliotecas.proprietario_id
      where livros.id = emprestimos.livro_id
        and proprietarios.usuario_auth_id = (select auth.uid())
    )
  );

create function public.localizar_biblioteca_publica(
  p_identificador_publico uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.bibliotecas
    where bibliotecas.identificador_publico = p_identificador_publico
  );
$$;

create function public.listar_livros_publicos(
  p_identificador_publico uuid
)
returns table (
  id uuid,
  isbn text,
  titulo text,
  autor text,
  editora text,
  imagem_capa text
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
    livros.imagem_capa
  from public.livros
  join public.bibliotecas
    on bibliotecas.id = livros.biblioteca_id
  where bibliotecas.identificador_publico = p_identificador_publico
    and livros.situacao = 'disponivel';
$$;

create function public.criar_solicitacao_publica(
  p_identificador_publico uuid,
  p_livro_id uuid,
  p_nome_solicitante text,
  p_telefone_solicitante text
)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_solicitacao_id uuid;
begin
  if p_nome_solicitante is null or btrim(p_nome_solicitante) = '' then
    raise exception 'Nome do solicitante é obrigatório.'
      using errcode = '22023';
  end if;

  if p_telefone_solicitante is null or btrim(p_telefone_solicitante) = '' then
    raise exception 'Telefone do solicitante é obrigatório.'
      using errcode = '22023';
  end if;

  insert into public.solicitacoes (
    livro_id,
    nome_solicitante,
    telefone_solicitante,
    data_solicitacao,
    status
  )
  select
    livros.id,
    btrim(p_nome_solicitante),
    btrim(p_telefone_solicitante),
    now(),
    'pendente'
  from public.livros
  join public.bibliotecas
    on bibliotecas.id = livros.biblioteca_id
  where bibliotecas.identificador_publico = p_identificador_publico
    and livros.id = p_livro_id
    and livros.situacao = 'disponivel'
  returning solicitacoes.id into v_solicitacao_id;

  if v_solicitacao_id is null then
    raise exception 'Livro indisponível ou não pertencente à biblioteca informada.'
      using errcode = 'P0001';
  end if;

  return v_solicitacao_id;
end;
$$;

revoke all
  on function public.localizar_biblioteca_publica(uuid)
  from public, anon, authenticated;
revoke all
  on function public.listar_livros_publicos(uuid)
  from public, anon, authenticated;
revoke all
  on function public.criar_solicitacao_publica(uuid, uuid, text, text)
  from public, anon, authenticated;

grant execute
  on function public.localizar_biblioteca_publica(uuid)
  to anon;
grant execute
  on function public.listar_livros_publicos(uuid)
  to anon;
grant execute
  on function public.criar_solicitacao_publica(uuid, uuid, text, text)
  to anon;
