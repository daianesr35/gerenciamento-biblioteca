create or replace function public.confirmar_solicitacao_privada(
  p_solicitacao_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_solicitacao public.solicitacoes%rowtype;
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'unauthorized';
  end if;

  select solicitacoes.*
    into v_solicitacao
  from public.solicitacoes
  join public.livros on livros.id = solicitacoes.livro_id
  join public.bibliotecas on bibliotecas.id = livros.biblioteca_id
  join public.proprietarios on proprietarios.id = bibliotecas.proprietario_id
  where solicitacoes.id = p_solicitacao_id
    and proprietarios.usuario_auth_id = auth.uid()
    and solicitacoes.status = 'pendente'
  for update of solicitacoes, livros;

  if v_solicitacao.id is null then
    raise exception using errcode = 'P0001', message = 'invalid_request';
  end if;

  update public.livros
  set situacao = 'emprestado'
  where id = v_solicitacao.livro_id
    and situacao = 'disponivel';

  if not found then
    raise exception using errcode = 'P0002', message = 'book_unavailable';
  end if;

  insert into public.emprestimos (
    livro_id,
    solicitacao_id,
    nome_solicitante,
    telefone_solicitante
  )
  values (
    v_solicitacao.livro_id,
    v_solicitacao.id,
    v_solicitacao.nome_solicitante,
    v_solicitacao.telefone_solicitante
  );

  update public.solicitacoes
  set status = 'confirmada'
  where id = v_solicitacao.id
    and status = 'pendente';

  if not found then
    raise exception using errcode = 'P0001', message = 'invalid_request';
  end if;
end;
$$;

insert into public.emprestimos (
  livro_id,
  solicitacao_id,
  nome_solicitante,
  telefone_solicitante
)
select
  solicitacoes.livro_id,
  solicitacoes.id,
  solicitacoes.nome_solicitante,
  solicitacoes.telefone_solicitante
from public.solicitacoes
join public.livros on livros.id = solicitacoes.livro_id
where solicitacoes.status = 'confirmada'
  and livros.situacao = 'emprestado'
  and not exists (
    select 1
    from public.emprestimos
    where emprestimos.solicitacao_id = solicitacoes.id
  )
  and not exists (
    select 1
    from public.emprestimos
    where emprestimos.livro_id = solicitacoes.livro_id
      and emprestimos.data_devolucao is null
  )
  and (
    select count(*)
    from public.solicitacoes as candidatas
    where candidatas.livro_id = solicitacoes.livro_id
      and candidatas.status = 'confirmada'
      and not exists (
        select 1
        from public.emprestimos
        where emprestimos.solicitacao_id = candidatas.id
      )
  ) = 1;

create function public.criar_emprestimo_direto_privado(
  p_livro_id uuid,
  p_nome_solicitante text,
  p_telefone_solicitante text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_emprestimo_id uuid;
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'unauthorized';
  end if;

  if p_nome_solicitante is null or btrim(p_nome_solicitante) = '' then
    raise exception using errcode = '22023', message = 'invalid_name';
  end if;

  if p_telefone_solicitante is null
    or btrim(p_telefone_solicitante) = ''
  then
    raise exception using errcode = '22023', message = 'invalid_phone';
  end if;

  perform 1
  from public.livros
  join public.bibliotecas on bibliotecas.id = livros.biblioteca_id
  join public.proprietarios on proprietarios.id = bibliotecas.proprietario_id
  where livros.id = p_livro_id
    and proprietarios.usuario_auth_id = auth.uid()
  for update of livros;

  if not found then
    raise exception using errcode = 'P0001', message = 'invalid_book';
  end if;

  update public.livros
  set situacao = 'emprestado'
  where id = p_livro_id
    and situacao = 'disponivel';

  if not found then
    raise exception using errcode = 'P0002', message = 'book_unavailable';
  end if;

  insert into public.emprestimos (
    livro_id,
    solicitacao_id,
    nome_solicitante,
    telefone_solicitante
  )
  values (
    p_livro_id,
    null,
    btrim(p_nome_solicitante),
    btrim(p_telefone_solicitante)
  )
  returning id into v_emprestimo_id;

  return v_emprestimo_id;
end;
$$;

create function public.registrar_devolucao_privada(
  p_emprestimo_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_livro_id uuid;
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'unauthorized';
  end if;

  select emprestimos.livro_id
    into v_livro_id
  from public.emprestimos
  join public.livros on livros.id = emprestimos.livro_id
  join public.bibliotecas on bibliotecas.id = livros.biblioteca_id
  join public.proprietarios on proprietarios.id = bibliotecas.proprietario_id
  where emprestimos.id = p_emprestimo_id
    and proprietarios.usuario_auth_id = auth.uid()
    and emprestimos.data_devolucao is null
  for update of emprestimos, livros;

  if v_livro_id is null then
    raise exception using errcode = 'P0001', message = 'invalid_loan';
  end if;

  update public.emprestimos
  set data_devolucao = now()
  where id = p_emprestimo_id
    and data_devolucao is null;

  if not found then
    raise exception using errcode = 'P0001', message = 'invalid_loan';
  end if;

  update public.livros
  set situacao = 'disponivel'
  where id = v_livro_id
    and situacao = 'emprestado';

  if not found then
    raise exception using errcode = 'P0001', message = 'invalid_loan';
  end if;
end;
$$;

revoke all
  on function public.confirmar_solicitacao_privada(uuid)
  from public, anon;
revoke all
  on function public.criar_emprestimo_direto_privado(uuid, text, text)
  from public, anon;
revoke all
  on function public.registrar_devolucao_privada(uuid)
  from public, anon;

grant execute
  on function public.confirmar_solicitacao_privada(uuid)
  to authenticated;
grant execute
  on function public.criar_emprestimo_direto_privado(uuid, text, text)
  to authenticated;
grant execute
  on function public.registrar_devolucao_privada(uuid)
  to authenticated;

comment on function public.confirmar_solicitacao_privada(uuid) is
  'Confirma uma solicitação pendente própria, cria seu empréstimo e marca o livro como emprestado na mesma transação.';
comment on function public.criar_emprestimo_direto_privado(uuid, text, text) is
  'Cria um empréstimo direto para livro próprio disponível e marca o livro como emprestado na mesma transação.';
comment on function public.registrar_devolucao_privada(uuid) is
  'Registra uma única devolução de empréstimo próprio e torna o livro disponível na mesma transação.';
