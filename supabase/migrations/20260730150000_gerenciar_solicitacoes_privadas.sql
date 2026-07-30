create function public.confirmar_solicitacao_privada(p_solicitacao_id uuid)
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

  select solicitacoes.livro_id
    into v_livro_id
  from public.solicitacoes
  join public.livros on livros.id = solicitacoes.livro_id
  join public.bibliotecas on bibliotecas.id = livros.biblioteca_id
  join public.proprietarios on proprietarios.id = bibliotecas.proprietario_id
  where solicitacoes.id = p_solicitacao_id
    and proprietarios.usuario_auth_id = auth.uid()
    and solicitacoes.status = 'pendente'
  for update of solicitacoes, livros;

  if v_livro_id is null then
    raise exception using errcode = 'P0001', message = 'invalid_request';
  end if;

  update public.livros
  set situacao = 'emprestado'
  where id = v_livro_id and situacao = 'disponivel';

  if not found then
    raise exception using errcode = 'P0002', message = 'book_unavailable';
  end if;

  update public.solicitacoes
  set status = 'confirmada'
  where id = p_solicitacao_id and status = 'pendente';

  if not found then
    raise exception using errcode = 'P0001', message = 'invalid_request';
  end if;
end;
$$;

create function public.recusar_solicitacao_privada(p_solicitacao_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'unauthorized';
  end if;

  update public.solicitacoes
  set status = 'recusada'
  where id = p_solicitacao_id
    and status = 'pendente'
    and exists (
      select 1
      from public.livros
      join public.bibliotecas on bibliotecas.id = livros.biblioteca_id
      join public.proprietarios on proprietarios.id = bibliotecas.proprietario_id
      where livros.id = solicitacoes.livro_id
        and proprietarios.usuario_auth_id = auth.uid()
    );

  if not found then
    raise exception using errcode = 'P0001', message = 'invalid_request';
  end if;
end;
$$;

revoke all on function public.confirmar_solicitacao_privada(uuid) from public, anon;
revoke all on function public.recusar_solicitacao_privada(uuid) from public, anon;
grant execute on function public.confirmar_solicitacao_privada(uuid) to authenticated;
grant execute on function public.recusar_solicitacao_privada(uuid) to authenticated;

comment on function public.confirmar_solicitacao_privada(uuid) is
  'Confirma atomicamente uma solicitação pendente própria e marca o livro disponível como emprestado. EXECUTE somente para authenticated.';
comment on function public.recusar_solicitacao_privada(uuid) is
  'Recusa uma solicitação pendente própria sem alterar o livro. EXECUTE somente para authenticated.';
