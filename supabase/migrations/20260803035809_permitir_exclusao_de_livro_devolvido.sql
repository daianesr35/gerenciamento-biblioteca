create function public.excluir_livro_privado(p_livro_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_situacao text;
begin
  select livros.situacao
    into v_situacao
  from public.livros
  join public.bibliotecas
    on bibliotecas.id = livros.biblioteca_id
  join public.proprietarios
    on proprietarios.id = bibliotecas.proprietario_id
  where livros.id = p_livro_id
    and proprietarios.usuario_auth_id = (select auth.uid())
  for update of livros;

  if v_situacao is null then
    return 'not_found';
  end if;

  if v_situacao <> 'disponivel' or exists (
    select 1
    from public.emprestimos
    where emprestimos.livro_id = p_livro_id
      and emprestimos.data_devolucao is null
  ) then
    return 'active_loan';
  end if;

  delete from public.emprestimos
  where emprestimos.livro_id = p_livro_id;

  delete from public.solicitacoes
  where solicitacoes.livro_id = p_livro_id;

  delete from public.livros
  where livros.id = p_livro_id;

  return 'deleted';
end;
$$;

revoke all
  on function public.excluir_livro_privado(uuid)
  from public, anon, authenticated;

grant execute
  on function public.excluir_livro_privado(uuid)
  to authenticated;
