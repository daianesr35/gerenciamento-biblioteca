create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create function private.provisionar_proprietario_e_biblioteca()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nome text;
  v_email text;
  v_proprietario_id uuid;
begin
  if new.email is null then
    raise exception 'E-mail obrigatório para provisionamento.'
      using errcode = '22023';
  end if;

  v_email := lower(btrim(new.email));

  if v_email = ''
    or v_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  then
    raise exception 'E-mail inválido para provisionamento.'
      using errcode = '22023';
  end if;

  if jsonb_typeof(new.raw_user_meta_data -> 'nome') is distinct from 'string' then
    raise exception 'Nome obrigatório para provisionamento.'
      using errcode = '22023';
  end if;

  v_nome := regexp_replace(
    btrim(new.raw_user_meta_data ->> 'nome'),
    '\s+',
    ' ',
    'g'
  );

  if v_nome = '' then
    raise exception 'Nome obrigatório para provisionamento.'
      using errcode = '22023';
  end if;

  insert into public.proprietarios (usuario_auth_id, nome, email)
  values (new.id, v_nome, v_email)
  returning id into v_proprietario_id;

  insert into public.bibliotecas (proprietario_id)
  values (v_proprietario_id);

  return new;
end;
$$;

revoke all
  on function private.provisionar_proprietario_e_biblioteca()
  from public, anon, authenticated;

create trigger provisionar_proprietario_e_biblioteca_apos_criar_usuario
  after insert on auth.users
  for each row
  execute function private.provisionar_proprietario_e_biblioteca();
