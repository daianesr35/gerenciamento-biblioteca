begin;

do $$
begin
  if not has_function_privilege(
    'authenticated',
    'public.confirmar_solicitacao_privada(uuid)',
    'execute'
  ) or not has_function_privilege(
    'authenticated',
    'public.recusar_solicitacao_privada(uuid)',
    'execute'
  ) then
    raise exception 'Authenticated deve executar as RPCs privadas.';
  end if;

  if has_function_privilege(
    'anon',
    'public.confirmar_solicitacao_privada(uuid)',
    'execute'
  ) or has_function_privilege(
    'anon',
    'public.recusar_solicitacao_privada(uuid)',
    'execute'
  ) or has_function_privilege(
    'public',
    'public.confirmar_solicitacao_privada(uuid)',
    'execute'
  ) or has_function_privilege(
    'public',
    'public.recusar_solicitacao_privada(uuid)',
    'execute'
  ) then
    raise exception 'Anon e PUBLIC não devem executar as RPCs privadas.';
  end if;
end;
$$;

insert into auth.users (id, email, raw_user_meta_data)
values
  (
    '11000000-0000-0000-0000-000000000001',
    'rpc-a@example.test',
    '{"nome":"RPC A"}'::jsonb
  ),
  (
    '11000000-0000-0000-0000-000000000002',
    'rpc-b@example.test',
    '{"nome":"RPC B"}'::jsonb
  );

delete from public.bibliotecas
where proprietario_id in (
  select id from public.proprietarios
  where usuario_auth_id in (
    '11000000-0000-0000-0000-000000000001',
    '11000000-0000-0000-0000-000000000002'
  )
);
delete from public.proprietarios
where usuario_auth_id in (
  '11000000-0000-0000-0000-000000000001',
  '11000000-0000-0000-0000-000000000002'
);

insert into public.proprietarios (id, usuario_auth_id, nome, email)
values
  (
    '21000000-0000-0000-0000-000000000001',
    '11000000-0000-0000-0000-000000000001',
    'RPC A',
    'rpc-a@example.test'
  ),
  (
    '21000000-0000-0000-0000-000000000002',
    '11000000-0000-0000-0000-000000000002',
    'RPC B',
    'rpc-b@example.test'
  );

insert into public.bibliotecas (id, proprietario_id, identificador_publico)
values
  (
    '31000000-0000-0000-0000-000000000001',
    '21000000-0000-0000-0000-000000000001',
    '41000000-0000-0000-0000-000000000001'
  ),
  (
    '31000000-0000-0000-0000-000000000002',
    '21000000-0000-0000-0000-000000000002',
    '41000000-0000-0000-0000-000000000002'
  );

insert into public.livros (id, biblioteca_id, titulo, autor, situacao)
values
  ('51000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000001', 'Confirmar', 'A', 'disponivel'),
  ('51000000-0000-0000-0000-000000000002', '31000000-0000-0000-0000-000000000001', 'Recusar', 'A', 'disponivel'),
  ('51000000-0000-0000-0000-000000000003', '31000000-0000-0000-0000-000000000002', 'Outra biblioteca', 'B', 'disponivel'),
  ('51000000-0000-0000-0000-000000000004', '31000000-0000-0000-0000-000000000001', 'Indisponível', 'A', 'emprestado'),
  ('51000000-0000-0000-0000-000000000005', '31000000-0000-0000-0000-000000000001', 'Concorrência', 'A', 'disponivel');

insert into public.solicitacoes (
  id, livro_id, nome_solicitante, telefone_solicitante, status
)
values
  ('61000000-0000-0000-0000-000000000001', '51000000-0000-0000-0000-000000000001', 'Confirmar', '1101', 'pendente'),
  ('61000000-0000-0000-0000-000000000002', '51000000-0000-0000-0000-000000000002', 'Recusar', '1102', 'pendente'),
  ('61000000-0000-0000-0000-000000000003', '51000000-0000-0000-0000-000000000003', 'Outra', '1103', 'pendente'),
  ('61000000-0000-0000-0000-000000000004', '51000000-0000-0000-0000-000000000004', 'Indisponível', '1104', 'pendente'),
  ('61000000-0000-0000-0000-000000000005', '51000000-0000-0000-0000-000000000005', 'Primeira', '1105', 'pendente'),
  ('61000000-0000-0000-0000-000000000006', '51000000-0000-0000-0000-000000000005', 'Segunda', '1106', 'pendente');

set local request.jwt.claims =
  '{"sub":"11000000-0000-0000-0000-000000000001","role":"authenticated"}';
set local role authenticated;

select public.confirmar_solicitacao_privada(
  '61000000-0000-0000-0000-000000000001'
);
select public.recusar_solicitacao_privada(
  '61000000-0000-0000-0000-000000000002'
);

reset role;

do $$
begin
  if (select status from public.solicitacoes where id = '61000000-0000-0000-0000-000000000001') <> 'confirmada'
    or (select situacao from public.livros where id = '51000000-0000-0000-0000-000000000001') <> 'emprestado'
  then
    raise exception 'Confirmação válida não atualizou Solicitação e Livro.';
  end if;

  if (select status from public.solicitacoes where id = '61000000-0000-0000-0000-000000000002') <> 'recusada'
    or (select situacao from public.livros where id = '51000000-0000-0000-0000-000000000002') <> 'disponivel'
  then
    raise exception 'Recusa válida alterou dados incorretamente.';
  end if;

  if exists (
    select 1 from public.emprestimos
    where solicitacao_id in (
      '61000000-0000-0000-0000-000000000001',
      '61000000-0000-0000-0000-000000000002'
    )
  ) then
    raise exception 'As RPCs privadas não devem criar Empréstimos.';
  end if;
end;
$$;

set local role authenticated;

do $$
begin
  perform public.confirmar_solicitacao_privada('61000000-0000-0000-0000-000000000003');
  raise exception using errcode = 'P0099', message = 'Não deveria confirmar solicitação de outra Biblioteca.';
exception when sqlstate 'P0001' then null;
end;
$$;

do $$
begin
  perform public.recusar_solicitacao_privada('61000000-0000-0000-0000-000000000003');
  raise exception using errcode = 'P0099', message = 'Não deveria recusar solicitação de outra Biblioteca.';
exception when sqlstate 'P0001' then null;
end;
$$;

do $$
begin
  perform public.confirmar_solicitacao_privada('61000000-0000-0000-0000-000000000001');
  raise exception using errcode = 'P0099', message = 'Não deveria confirmar solicitação já processada.';
exception when sqlstate 'P0001' then null;
end;
$$;

do $$
begin
  perform public.recusar_solicitacao_privada('61000000-0000-0000-0000-000000000002');
  raise exception using errcode = 'P0099', message = 'Não deveria recusar solicitação já processada.';
exception when sqlstate 'P0001' then null;
end;
$$;

do $$
begin
  perform public.confirmar_solicitacao_privada('61000000-0000-0000-0000-000000000004');
  raise exception 'Não deveria confirmar Livro indisponível.';
exception when sqlstate 'P0002' then null;
end;
$$;

select public.confirmar_solicitacao_privada(
  '61000000-0000-0000-0000-000000000005'
);

do $$
begin
  perform public.confirmar_solicitacao_privada('61000000-0000-0000-0000-000000000006');
  raise exception 'A segunda confirmação para o mesmo Livro deveria falhar.';
exception when sqlstate 'P0002' then null;
end;
$$;

reset role;

do $$
begin
  if (select status from public.solicitacoes where id = '61000000-0000-0000-0000-000000000003') <> 'pendente'
    or (select situacao from public.livros where id = '51000000-0000-0000-0000-000000000003') <> 'disponivel'
  then
    raise exception 'Isolamento deixou alterações parciais.';
  end if;

  if (select status from public.solicitacoes where id = '61000000-0000-0000-0000-000000000004') <> 'pendente'
    or (select situacao from public.livros where id = '51000000-0000-0000-0000-000000000004') <> 'emprestado'
  then
    raise exception 'Falha por indisponibilidade deixou alterações parciais.';
  end if;

  if (select status from public.solicitacoes where id = '61000000-0000-0000-0000-000000000006') <> 'pendente'
    or (select situacao from public.livros where id = '51000000-0000-0000-0000-000000000005') <> 'emprestado'
  then
    raise exception 'Segunda confirmação deixou alterações parciais.';
  end if;

  if position(
    'FOR UPDATE' in upper(
      pg_get_functiondef('public.confirmar_solicitacao_privada(uuid)'::regprocedure)
    )
  ) = 0 then
    raise exception 'A confirmação deve manter bloqueio FOR UPDATE.';
  end if;
end;
$$;

-- O teste reproduz a segunda confirmação após o bloqueio/consumo do Livro.
-- Duas sessões simultâneas não são abertas para evitar infraestrutura adicional;
-- a RPC mantém FOR UPDATE e a segunda transição falha pela disponibilidade.
rollback;
