create function public.obter_nome_proprietario_publico(
  p_identificador_publico uuid
)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select proprietarios.nome
  from public.bibliotecas
  join public.proprietarios
    on proprietarios.id = bibliotecas.proprietario_id
  where bibliotecas.identificador_publico = p_identificador_publico;
$$;

revoke all
  on function public.obter_nome_proprietario_publico(uuid)
  from public, anon, authenticated;

grant execute
  on function public.obter_nome_proprietario_publico(uuid)
  to anon;
