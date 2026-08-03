begin;

do $$
begin
  if not has_function_privilege(
    'authenticated',
    'public.criar_emprestimo_direto_privado(uuid,text,text)',
    'execute'
  ) or not has_function_privilege(
    'authenticated',
    'public.registrar_devolucao_privada(uuid)',
    'execute'
  ) or not has_function_privilege(
    'authenticated',
    'public.excluir_livro_privado(uuid)',
    'execute'
  ) then
    raise exception 'Authenticated deve executar as RPCs privadas de empréstimos.';
  end if;

  if has_function_privilege(
    'anon',
    'public.criar_emprestimo_direto_privado(uuid,text,text)',
    'execute'
  ) or has_function_privilege(
    'public',
    'public.criar_emprestimo_direto_privado(uuid,text,text)',
    'execute'
  ) or has_function_privilege(
    'anon',
    'public.registrar_devolucao_privada(uuid)',
    'execute'
  ) or has_function_privilege(
    'public',
    'public.registrar_devolucao_privada(uuid)',
    'execute'
  ) or has_function_privilege(
    'anon',
    'public.excluir_livro_privado(uuid)',
    'execute'
  ) or has_function_privilege(
    'public',
    'public.excluir_livro_privado(uuid)',
    'execute'
  ) then
    raise exception 'Anon e PUBLIC não devem executar as RPCs privadas de empréstimos.';
  end if;
end;
$$;

insert into auth.users (id, email, raw_user_meta_data)
values
  (
    '12000000-0000-0000-0000-000000000001',
    'loans-a@example.test',
    '{"nome":"Loans A"}'::jsonb
  ),
  (
    '12000000-0000-0000-0000-000000000002',
    'loans-b@example.test',
    '{"nome":"Loans B"}'::jsonb
  );

delete from public.bibliotecas
where proprietario_id in (
  select id
  from public.proprietarios
  where usuario_auth_id in (
    '12000000-0000-0000-0000-000000000001',
    '12000000-0000-0000-0000-000000000002'
  )
);
delete from public.proprietarios
where usuario_auth_id in (
  '12000000-0000-0000-0000-000000000001',
  '12000000-0000-0000-0000-000000000002'
);

insert into public.proprietarios (id, usuario_auth_id, nome, email)
values
  (
    '22000000-0000-0000-0000-000000000001',
    '12000000-0000-0000-0000-000000000001',
    'Loans A',
    'loans-a@example.test'
  ),
  (
    '22000000-0000-0000-0000-000000000002',
    '12000000-0000-0000-0000-000000000002',
    'Loans B',
    'loans-b@example.test'
  );

insert into public.bibliotecas (id, proprietario_id, identificador_publico)
values
  (
    '32000000-0000-0000-0000-000000000001',
    '22000000-0000-0000-0000-000000000001',
    '42000000-0000-0000-0000-000000000001'
  ),
  (
    '32000000-0000-0000-0000-000000000002',
    '22000000-0000-0000-0000-000000000002',
    '42000000-0000-0000-0000-000000000002'
  );

insert into public.livros (id, biblioteca_id, titulo, autor, situacao)
values
  ('52000000-0000-0000-0000-000000000001', '32000000-0000-0000-0000-000000000001', 'Direto', 'A', 'disponivel'),
  ('52000000-0000-0000-0000-000000000002', '32000000-0000-0000-0000-000000000001', 'Indisponível', 'A', 'emprestado'),
  ('52000000-0000-0000-0000-000000000003', '32000000-0000-0000-0000-000000000002', 'Outra', 'B', 'emprestado'),
  ('52000000-0000-0000-0000-000000000004', '32000000-0000-0000-0000-000000000001', 'Backfill', 'A', 'emprestado'),
  ('52000000-0000-0000-0000-000000000005', '32000000-0000-0000-0000-000000000001', 'Rollback', 'A', 'disponivel');

insert into public.solicitacoes (
  id,
  livro_id,
  nome_solicitante,
  telefone_solicitante,
  status
)
values (
  '62000000-0000-0000-0000-000000000001',
  '52000000-0000-0000-0000-000000000004',
  'Backfill',
  '2201',
  'confirmada'
);

insert into public.emprestimos (
  id,
  livro_id,
  nome_solicitante,
  telefone_solicitante
)
values (
  '72000000-0000-0000-0000-000000000002',
  '52000000-0000-0000-0000-000000000003',
  'Outra biblioteca',
  '2200'
);

set local request.jwt.claims =
  '{"sub":"12000000-0000-0000-0000-000000000001","role":"authenticated"}';
set local role authenticated;

select public.criar_emprestimo_direto_privado(
  '52000000-0000-0000-0000-000000000001',
  '  Direto  ',
  '  11999990000  '
);

do $$
begin
  perform public.criar_emprestimo_direto_privado(
    '52000000-0000-0000-0000-000000000001',
    'Concorrente',
    '11999990001'
  );
  raise exception 'Segundo empréstimo direto deveria falhar.';
exception when sqlstate 'P0002' then null;
end;
$$;

do $$
begin
  perform public.criar_emprestimo_direto_privado(
    '52000000-0000-0000-0000-000000000003',
    'Outra',
    '11999990002'
  );
  raise exception 'Empréstimo direto de outra biblioteca deveria falhar.';
exception when sqlstate 'P0001' then null;
end;
$$;

do $$
begin
  perform public.registrar_devolucao_privada(
    '72000000-0000-0000-0000-000000000002'
  );
  raise exception 'Devolução de outra biblioteca deveria falhar.';
exception when sqlstate 'P0001' then null;
end;
$$;

do $$
begin
  perform public.criar_emprestimo_direto_privado(
    '52000000-0000-0000-0000-000000000002',
    'Indisponível',
    '11999990003'
  );
  raise exception 'Livro indisponível deveria falhar.';
exception when sqlstate 'P0002' then null;
end;
$$;

reset role;

do $$
declare
  v_emprestimo_id uuid;
begin
  select id
    into v_emprestimo_id
  from public.emprestimos
  where livro_id = '52000000-0000-0000-0000-000000000001'
    and solicitacao_id is null;

  if v_emprestimo_id is null
    or (
      select nome_solicitante <> 'Direto'
        or telefone_solicitante <> '11999990000'
        or data_emprestimo is null
        or data_devolucao is not null
      from public.emprestimos
      where id = v_emprestimo_id
    )
    or (
      select situacao
      from public.livros
      where id = '52000000-0000-0000-0000-000000000001'
    ) <> 'emprestado'
  then
    raise exception 'Empréstimo direto não foi criado corretamente.';
  end if;

  if (
    select count(*)
    from public.emprestimos
    where livro_id = '52000000-0000-0000-0000-000000000002'
  ) <> 0 then
    raise exception 'Falha de empréstimo deixou inserção parcial.';
  end if;
end;
$$;

set local role authenticated;

do $$
begin
  if (
    select count(*)
    from public.emprestimos
  ) <> 1 then
    raise exception 'RLS deve mostrar somente empréstimos próprios.';
  end if;
end;
$$;

select public.registrar_devolucao_privada(
  (
    select id
    from public.emprestimos
    where livro_id = '52000000-0000-0000-0000-000000000001'
  )
);

do $$
begin
  perform public.registrar_devolucao_privada(
    (
      select id
      from public.emprestimos
      where livro_id = '52000000-0000-0000-0000-000000000001'
    )
  );
  raise exception 'Devolução repetida deveria falhar.';
exception when sqlstate 'P0001' then null;
end;
$$;

reset role;

do $$
begin
  if (
    select data_devolucao
    from public.emprestimos
    where livro_id = '52000000-0000-0000-0000-000000000001'
  ) is null or (
    select situacao
    from public.livros
    where id = '52000000-0000-0000-0000-000000000001'
  ) <> 'disponivel' then
    raise exception 'Devolução não atualizou empréstimo e livro.';
  end if;
end;
$$;

insert into public.emprestimos (
  id,
  livro_id,
  nome_solicitante,
  telefone_solicitante
)
values (
  '72000000-0000-0000-0000-000000000001',
  '52000000-0000-0000-0000-000000000005',
  'Rollback',
  '2202'
);

set local role authenticated;

do $$
begin
  perform public.registrar_devolucao_privada(
    '72000000-0000-0000-0000-000000000001'
  );
  raise exception 'Estado inconsistente do livro deveria causar rollback.';
exception when sqlstate 'P0001' then null;
end;
$$;

reset role;

do $$
begin
  if (
    select data_devolucao
    from public.emprestimos
    where id = '72000000-0000-0000-0000-000000000001'
  ) is not null then
    raise exception 'Falha na devolução deixou atualização parcial.';
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

-- Reaplicação intencional para validar idempotência.
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

do $$
begin
  if (
    select count(*)
    from public.emprestimos
    where solicitacao_id = '62000000-0000-0000-0000-000000000001'
      and livro_id = '52000000-0000-0000-0000-000000000004'
      and nome_solicitante = 'Backfill'
      and telefone_solicitante = '2201'
  ) <> 1 then
    raise exception 'Backfill deve criar exatamente um empréstimo válido.';
  end if;

  if position(
    'FOR UPDATE' in upper(
      pg_get_functiondef(
        'public.criar_emprestimo_direto_privado(uuid,text,text)'::regprocedure
      )
    )
  ) = 0 or position(
    'FOR UPDATE' in upper(
      pg_get_functiondef(
        'public.registrar_devolucao_privada(uuid)'::regprocedure
      )
    )
  ) = 0 then
    raise exception 'As operações devem manter bloqueios FOR UPDATE.';
  end if;
end;
$$;

insert into public.livros (id, biblioteca_id, titulo, autor, situacao)
values
  ('52000000-0000-0000-0000-000000000006', '32000000-0000-0000-0000-000000000001', 'Livro devolvido', 'A', 'disponivel'),
  ('52000000-0000-0000-0000-000000000007', '32000000-0000-0000-0000-000000000001', 'Livro ativo', 'A', 'emprestado'),
  ('52000000-0000-0000-0000-000000000008', '32000000-0000-0000-0000-000000000001', 'Livro nunca emprestado', 'A', 'disponivel');

insert into public.solicitacoes (
  id,
  livro_id,
  nome_solicitante,
  telefone_solicitante,
  status
)
values (
  '62000000-0000-0000-0000-000000000006',
  '52000000-0000-0000-0000-000000000006',
  'Histórico devolvido',
  '2206',
  'confirmada'
);

insert into public.emprestimos (
  id,
  livro_id,
  solicitacao_id,
  nome_solicitante,
  telefone_solicitante,
  data_devolucao
)
values
  (
    '72000000-0000-0000-0000-000000000006',
    '52000000-0000-0000-0000-000000000006',
    '62000000-0000-0000-0000-000000000006',
    'Histórico devolvido',
    '2206',
    now()
  ),
  (
    '72000000-0000-0000-0000-000000000007',
    '52000000-0000-0000-0000-000000000007',
    null,
    'Empréstimo ativo',
    '2207',
    null
  );

set local role authenticated;

do $$
begin
  if public.excluir_livro_privado(
    '52000000-0000-0000-0000-000000000008'
  ) <> 'deleted' then
    raise exception 'Livro nunca emprestado deveria ser excluído.';
  end if;

  if public.excluir_livro_privado(
    '52000000-0000-0000-0000-000000000006'
  ) <> 'deleted' then
    raise exception 'Livro devolvido deveria ser excluído.';
  end if;

  if public.excluir_livro_privado(
    '52000000-0000-0000-0000-000000000007'
  ) <> 'active_loan' then
    raise exception 'Livro com empréstimo ativo deveria permanecer bloqueado.';
  end if;

  if public.excluir_livro_privado(
    '52000000-0000-0000-0000-000000000003'
  ) <> 'not_found' then
    raise exception 'Usuário não deveria excluir Livro de outra Biblioteca.';
  end if;
end;
$$;

reset role;

do $$
begin
  if exists (
    select 1 from public.livros
    where id = '52000000-0000-0000-0000-000000000008'
  ) then
    raise exception 'Livro nunca emprestado deveria ter sido removido.';
  end if;

  if exists (
    select 1 from public.livros
    where id = '52000000-0000-0000-0000-000000000006'
  ) or exists (
    select 1 from public.solicitacoes
    where id = '62000000-0000-0000-0000-000000000006'
  ) or exists (
    select 1 from public.emprestimos
    where id = '72000000-0000-0000-0000-000000000006'
  ) then
    raise exception 'Exclusão deveria remover somente o histórico do Livro devolvido.';
  end if;

  if not exists (
    select 1 from public.livros
    where id = '52000000-0000-0000-0000-000000000007'
  ) or not exists (
    select 1 from public.emprestimos
    where id = '72000000-0000-0000-0000-000000000007'
  ) then
    raise exception 'Bloqueio deveria preservar Livro e empréstimo ativos.';
  end if;

  if not exists (
    select 1 from public.livros
    where id = '52000000-0000-0000-0000-000000000003'
  ) or not exists (
    select 1 from public.emprestimos
    where id = '72000000-0000-0000-0000-000000000002'
  ) then
    raise exception 'Tentativa de outra Biblioteca não deveria alterar registros.';
  end if;
end;
$$;

rollback;
