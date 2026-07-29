begin;

insert into auth.users (id, email, raw_user_meta_data)
values (
  '81000000-0000-0000-0000-000000000001',
  '  USUARIO-A@EXAMPLE.TEST  ',
  '{"nome":"  Usuária   A  "}'::jsonb
);

insert into auth.users (id, email, raw_user_meta_data)
values (
  '81000000-0000-0000-0000-000000000002',
  'usuario-b@example.test',
  '{"nome":"Usuário B"}'::jsonb
);

do $$
declare
  v_proprietario_a_id uuid;
begin
  if (
    select count(*)
    from public.proprietarios
    where usuario_auth_id = '81000000-0000-0000-0000-000000000001'
  ) <> 1 then
    raise exception 'Usuário válido deveria criar exatamente um Proprietário.';
  end if;

  select id
  into v_proprietario_a_id
  from public.proprietarios
  where usuario_auth_id = '81000000-0000-0000-0000-000000000001';

  if not exists (
    select 1
    from public.proprietarios
    where id = v_proprietario_a_id
      and nome = 'Usuária A'
      and email = 'usuario-a@example.test'
  ) then
    raise exception 'Dados do Proprietário não foram normalizados corretamente.';
  end if;

  if (
    select count(*)
    from public.bibliotecas
    where proprietario_id = v_proprietario_a_id
  ) <> 1 then
    raise exception 'Usuário válido deveria criar exatamente uma Biblioteca.';
  end if;

  if (
    select count(*)
    from public.proprietarios
    where usuario_auth_id in (
      '81000000-0000-0000-0000-000000000001',
      '81000000-0000-0000-0000-000000000002'
    )
  ) <> 2 then
    raise exception 'Dois usuários deveriam receber Proprietários separados.';
  end if;

  if (
    select count(distinct bibliotecas.proprietario_id)
    from public.bibliotecas
    join public.proprietarios
      on proprietarios.id = bibliotecas.proprietario_id
    where proprietarios.usuario_auth_id in (
      '81000000-0000-0000-0000-000000000001',
      '81000000-0000-0000-0000-000000000002'
    )
  ) <> 2 then
    raise exception 'Dois usuários deveriam receber Bibliotecas separadas.';
  end if;
end;
$$;

do $$
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (
    '81000000-0000-0000-0000-000000000003',
    'sem-nome@example.test',
    '{}'::jsonb
  );
  raise exception 'Cadastro sem nome deveria falhar.';
exception
  when invalid_parameter_value then
    null;
end;
$$;

do $$
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (
    '81000000-0000-0000-0000-000000000004',
    'invalido',
    '{"nome":"Nome válido"}'::jsonb
  );
  raise exception 'Cadastro com e-mail inválido deveria falhar.';
exception
  when invalid_parameter_value then
    null;
end;
$$;

do $$
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (
    '81000000-0000-0000-0000-000000000005',
    null,
    '{"nome":"Nome válido"}'::jsonb
  );
  raise exception 'Cadastro sem e-mail deveria falhar.';
exception
  when invalid_parameter_value then
    null;
end;
$$;

create function pg_temp.impedir_biblioteca()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Falha simulada na Biblioteca.'
    using errcode = '23514';
end;
$$;

create trigger impedir_biblioteca_no_teste
  before insert on public.bibliotecas
  for each row
  execute function pg_temp.impedir_biblioteca();

do $$
begin
  insert into auth.users (id, email, raw_user_meta_data)
  values (
    '81000000-0000-0000-0000-000000000006',
    'rollback@example.test',
    '{"nome":"Teste de rollback"}'::jsonb
  );
  raise exception 'Falha na Biblioteca deveria impedir o cadastro.';
exception
  when check_violation then
    null;
end;
$$;

drop trigger impedir_biblioteca_no_teste on public.bibliotecas;

do $$
begin
  if exists (
    select 1
    from auth.users
    where id = '81000000-0000-0000-0000-000000000006'
  ) or exists (
    select 1
    from public.proprietarios
    where usuario_auth_id = '81000000-0000-0000-0000-000000000006'
  ) then
    raise exception 'Falha no provisionamento deveria provocar rollback integral.';
  end if;
end;
$$;

set local request.jwt.claims =
  '{"sub":"81000000-0000-0000-0000-000000000001","role":"authenticated"}';
set local role authenticated;

do $$
begin
  if (select count(*) from public.proprietarios) <> 1 then
    raise exception 'RLS deveria expor somente o Proprietário autenticado.';
  end if;

  if (select count(*) from public.bibliotecas) <> 1 then
    raise exception 'RLS deveria expor somente a Biblioteca autenticada.';
  end if;
end;
$$;

reset role;

do $$
begin
  if has_function_privilege(
    'anon',
    'private.provisionar_proprietario_e_biblioteca()',
    'execute'
  ) or has_function_privilege(
    'authenticated',
    'private.provisionar_proprietario_e_biblioteca()',
    'execute'
  ) then
    raise exception 'Função privada não pode ser executada pelos papéis da API.';
  end if;
end;
$$;

rollback;
