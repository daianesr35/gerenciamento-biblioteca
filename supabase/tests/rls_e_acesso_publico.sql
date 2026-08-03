begin;

insert into auth.users (id, email, raw_user_meta_data)
values
  (
    '10000000-0000-0000-0000-000000000001',
    'proprietario-a@example.test',
    '{"nome":"Proprietário A"}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'proprietario-b@example.test',
    '{"nome":"Proprietário B"}'::jsonb
  );

delete from public.bibliotecas
where proprietario_id in (
  select id
  from public.proprietarios
  where usuario_auth_id in (
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002'
  )
);

delete from public.proprietarios
where usuario_auth_id in (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002'
);

insert into public.proprietarios (id, usuario_auth_id, nome, email)
values
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Proprietário A',
    'proprietario-a@example.test'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    'Proprietário B',
    'proprietario-b@example.test'
  );

insert into public.bibliotecas (
  id,
  proprietario_id,
  identificador_publico
)
values
  (
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    '40000000-0000-0000-0000-000000000002'
  );

insert into public.livros (
  id,
  biblioteca_id,
  isbn,
  titulo,
  autor,
  editora,
  imagem_capa,
  categoria,
  situacao
)
values
  (
    '50000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '9780000000001',
    'Livro disponível A',
    'Autora A',
    'Editora A',
    'https://example.com/capa-a.jpg',
    'Ficção',
    'disponivel'
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000001',
    null,
    'Livro emprestado A',
    'Autor A',
    null,
    null,
    null,
    'emprestado'
  ),
  (
    '50000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000002',
    null,
    'Livro disponível B',
    'Autora B',
    null,
    null,
    'História',
    'disponivel'
  );

insert into public.solicitacoes (
  id,
  livro_id,
  nome_solicitante,
  telefone_solicitante,
  status
)
values
  (
    '60000000-0000-0000-0000-000000000001',
    '50000000-0000-0000-0000-000000000001',
    'Solicitante A',
    '11999990001',
    'pendente'
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    '50000000-0000-0000-0000-000000000003',
    'Solicitante B',
    '11999990002',
    'pendente'
  );

insert into public.emprestimos (
  id,
  livro_id,
  nome_solicitante,
  telefone_solicitante
)
values
  (
    '70000000-0000-0000-0000-000000000001',
    '50000000-0000-0000-0000-000000000002',
    'Solicitante A',
    '11999990001'
  ),
  (
    '70000000-0000-0000-0000-000000000002',
    '50000000-0000-0000-0000-000000000003',
    'Solicitante B',
    '11999990002'
  );

set local request.jwt.claims =
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}';
set local role authenticated;

do $$
begin
  if (select count(*) from public.proprietarios) <> 1 then
    raise exception 'Proprietário A deveria consultar apenas seu registro.';
  end if;
  if (select count(*) from public.bibliotecas) <> 1 then
    raise exception 'Proprietário A deveria consultar apenas sua Biblioteca.';
  end if;
  if (select count(*) from public.livros) <> 2 then
    raise exception 'Proprietário A deveria consultar apenas seus Livros.';
  end if;
  if (select count(*) from public.solicitacoes) <> 1 then
    raise exception 'Proprietário A deveria consultar apenas suas Solicitações.';
  end if;
  if (select count(*) from public.emprestimos) <> 1 then
    raise exception 'Proprietário A deveria consultar apenas seus Empréstimos.';
  end if;
end;
$$;

insert into public.livros (
  id,
  biblioteca_id,
  titulo,
  autor
)
values (
  '50000000-0000-0000-0000-000000000004',
  '30000000-0000-0000-0000-000000000001',
  'Livro temporário A',
  'Autora A'
);

update public.livros
set titulo = 'Livro temporário A atualizado'
where id = '50000000-0000-0000-0000-000000000004';

insert into public.solicitacoes (
  id,
  livro_id,
  nome_solicitante,
  telefone_solicitante
)
values (
  '60000000-0000-0000-0000-000000000004',
  '50000000-0000-0000-0000-000000000004',
  'Solicitante temporário A',
  '11999990004'
);

update public.solicitacoes
set status = 'recusada'
where id = '60000000-0000-0000-0000-000000000004';

insert into public.emprestimos (
  id,
  livro_id,
  nome_solicitante,
  telefone_solicitante
)
values (
  '70000000-0000-0000-0000-000000000004',
  '50000000-0000-0000-0000-000000000004',
  'Solicitante temporário A',
  '11999990004'
);

update public.emprestimos
set data_devolucao = now()
where id = '70000000-0000-0000-0000-000000000004';

delete from public.emprestimos
where id = '70000000-0000-0000-0000-000000000004';

delete from public.solicitacoes
where id = '60000000-0000-0000-0000-000000000004';

delete from public.livros
where id = '50000000-0000-0000-0000-000000000004';

do $$
declare
  v_linhas integer;
begin
  insert into public.livros (biblioteca_id, titulo, autor)
  values (
    '30000000-0000-0000-0000-000000000002',
    'Tentativa cruzada',
    'Proprietário A'
  );
  raise exception 'Inserção de Livro na Biblioteca B deveria ser negada.';
exception
  when insufficient_privilege then
    null;
end;
$$;

do $$
begin
  update public.livros
  set biblioteca_id = '30000000-0000-0000-0000-000000000002'
  where id = '50000000-0000-0000-0000-000000000001';
  raise exception 'Transferência de Livro para a Biblioteca B deveria ser negada.';
exception
  when insufficient_privilege then
    null;
end;
$$;

do $$
begin
  insert into public.solicitacoes (
    livro_id,
    nome_solicitante,
    telefone_solicitante
  )
  values (
    '50000000-0000-0000-0000-000000000003',
    'Tentativa cruzada',
    '11999999999'
  );
  raise exception 'Solicitação no Livro B deveria ser negada.';
exception
  when insufficient_privilege then
    null;
end;
$$;

do $$
begin
  insert into public.emprestimos (
    livro_id,
    nome_solicitante,
    telefone_solicitante
  )
  values (
    '50000000-0000-0000-0000-000000000003',
    'Tentativa cruzada',
    '11999999999'
  );
  raise exception 'Empréstimo no Livro B deveria ser negado.';
exception
  when insufficient_privilege then
    null;
end;
$$;

do $$
declare
  v_linhas integer;
begin
  update public.proprietarios
  set nome = 'Alteração indevida'
  where id = '20000000-0000-0000-0000-000000000002';
  get diagnostics v_linhas = row_count;
  if v_linhas <> 0 then
    raise exception 'Proprietário A alterou o Proprietário B.';
  end if;

  delete from public.livros
  where id = '50000000-0000-0000-0000-000000000003';
  get diagnostics v_linhas = row_count;
  if v_linhas <> 0 then
    raise exception 'Proprietário A excluiu Livro da Biblioteca B.';
  end if;
end;
$$;

reset role;
set local request.jwt.claims =
  '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}';
set local role authenticated;

do $$
begin
  if (select count(*) from public.proprietarios) <> 1 then
    raise exception 'Proprietário B deveria consultar apenas seu registro.';
  end if;
  if (select count(*) from public.bibliotecas) <> 1 then
    raise exception 'Proprietário B deveria consultar apenas sua Biblioteca.';
  end if;
  if (select count(*) from public.livros) <> 1 then
    raise exception 'Proprietário B deveria consultar apenas seus Livros.';
  end if;
  if (select count(*) from public.solicitacoes) <> 1 then
    raise exception 'Proprietário B deveria consultar apenas suas Solicitações.';
  end if;
  if (select count(*) from public.emprestimos) <> 1 then
    raise exception 'Proprietário B deveria consultar apenas seus Empréstimos.';
  end if;
end;
$$;

reset role;

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'livros'
      and column_name = 'categoria'
      and is_nullable = 'YES'
      and data_type = 'text'
  ) then
    raise exception 'A coluna opcional livros.categoria deveria existir como text.';
  end if;

  if not (
    select relrowsecurity
    from pg_class
    where oid = 'public.livros'::regclass
  ) then
    raise exception 'RLS deveria permanecer habilitada em public.livros.';
  end if;

  insert into public.livros (biblioteca_id, titulo, autor, categoria, situacao)
  values (
    '30000000-0000-0000-0000-000000000001',
    'Livro com categoria nula',
    'Autora A',
    null,
    'emprestado'
  );

  begin
    insert into public.livros (biblioteca_id, titulo, autor, categoria)
    values (
      '30000000-0000-0000-0000-000000000001',
      'Categoria inválida',
      'Autora A',
      '   '
    );
    raise exception 'Categoria composta apenas por espaços deveria ser rejeitada.';
  exception
    when check_violation then
      null;
  end;

  begin
    insert into public.livros (biblioteca_id, titulo, autor, categoria)
    values (
      '30000000-0000-0000-0000-000000000001',
      'Categoria vazia',
      'Autora A',
      ''
    );
    raise exception 'Categoria vazia deveria ser rejeitada.';
  exception
    when check_violation then
      null;
  end;
end;
$$;

set local request.jwt.claims = '{"role":"anon"}';
set local role anon;

do $$
declare
  v_livro record;
begin
  if not public.localizar_biblioteca_publica(
    '40000000-0000-0000-0000-000000000001'
  ) then
    raise exception 'Biblioteca A deveria ser localizada pelo identificador.';
  end if;

  if public.localizar_biblioteca_publica(
    '40000000-0000-0000-0000-000000000099'
  ) then
    raise exception 'Identificador inexistente não deveria localizar Biblioteca.';
  end if;

  if public.obter_nome_proprietario_publico(
    '40000000-0000-0000-0000-000000000001'
  ) <> 'Proprietário A' then
    raise exception 'Página Pública deveria exibir o nome do Proprietário A.';
  end if;

  if public.obter_nome_proprietario_publico(
    '40000000-0000-0000-0000-000000000099'
  ) is not null then
    raise exception 'Identificador inexistente não deveria expor nome.';
  end if;

  if (
    select count(*)
    from public.listar_livros_publicos(
      '40000000-0000-0000-0000-000000000001'
    )
  ) <> 1 then
    raise exception 'Catálogo público deveria conter apenas o Livro disponível A.';
  end if;

  select * into strict v_livro
  from public.listar_livros_publicos(
    '40000000-0000-0000-0000-000000000001'
  );

  if v_livro.id <> '50000000-0000-0000-0000-000000000001'
    or v_livro.isbn <> '9780000000001'
    or v_livro.titulo <> 'Livro disponível A'
    or v_livro.autor <> 'Autora A'
    or v_livro.editora <> 'Editora A'
    or v_livro.imagem_capa <> 'https://example.com/capa-a.jpg'
    or v_livro.categoria <> 'Ficção' then
    raise exception 'Catálogo público deveria preservar todas as colunas e retornar categoria.';
  end if;

  if not has_function_privilege(
    'anon',
    'public.listar_livros_publicos(uuid)',
    'EXECUTE'
  ) then
    raise exception 'Anon deveria preservar EXECUTE em listar_livros_publicos.';
  end if;

  if has_table_privilege('anon', 'public.livros', 'SELECT') then
    raise exception 'Anon não deveria receber grant SELECT em public.livros.';
  end if;
end;
$$;

select public.criar_solicitacao_publica(
  '40000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000001',
  '  Solicitante público  ',
  '  11988887777  '
);

do $$
begin
  perform public.criar_solicitacao_publica(
    '40000000-0000-0000-0000-000000000001',
    '50000000-0000-0000-0000-000000000002',
    'Solicitante público',
    '11988887777'
  );
  raise exception 'Solicitação pública para Livro emprestado deveria ser negada.';
exception
  when raise_exception then
    null;
end;
$$;

do $$
begin
  perform public.criar_solicitacao_publica(
    '40000000-0000-0000-0000-000000000001',
    '50000000-0000-0000-0000-000000000003',
    'Solicitante público',
    '11988887777'
  );
  raise exception 'Livro de outra Biblioteca deveria ser negado.';
exception
  when raise_exception then
    null;
end;
$$;

do $$
begin
  perform 1 from public.livros;
  raise exception 'Anon não deveria ler Livros diretamente.';
exception
  when insufficient_privilege then
    null;
end;
$$;

do $$
begin
  perform 1 from public.proprietarios;
  raise exception 'Anon não deveria ler Proprietários.';
exception
  when insufficient_privilege then
    null;
end;
$$;

do $$
begin
  perform 1 from public.solicitacoes;
  raise exception 'Anon não deveria ler Solicitações.';
exception
  when insufficient_privilege then
    null;
end;
$$;

do $$
begin
  perform 1 from public.emprestimos;
  raise exception 'Anon não deveria ler Empréstimos.';
exception
  when insufficient_privilege then
    null;
end;
$$;

do $$
begin
  insert into public.solicitacoes (
    livro_id,
    nome_solicitante,
    telefone_solicitante,
    status
  )
  values (
    '50000000-0000-0000-0000-000000000001',
    'Tentativa anônima',
    '11988887777',
    'confirmada'
  );
  raise exception 'Anon não deveria inserir Solicitação confirmada diretamente.';
exception
  when insufficient_privilege then
    null;
end;
$$;

do $$
begin
  update public.solicitacoes
  set status = 'recusada';
  raise exception 'Anon não deveria atualizar Solicitações.';
exception
  when insufficient_privilege then
    null;
end;
$$;

do $$
begin
  delete from public.solicitacoes;
  raise exception 'Anon não deveria excluir Solicitações.';
exception
  when insufficient_privilege then
    null;
end;
$$;

do $$
begin
  insert into public.emprestimos (
    livro_id,
    nome_solicitante,
    telefone_solicitante
  )
  values (
    '50000000-0000-0000-0000-000000000001',
    'Tentativa anônima',
    '11988887777'
  );
  raise exception 'Anon não deveria criar Empréstimos.';
exception
  when insufficient_privilege then
    null;
end;
$$;

do $$
begin
  update public.livros
  set situacao = 'emprestado';
  raise exception 'Anon não deveria atualizar Livros.';
exception
  when insufficient_privilege then
    null;
end;
$$;

reset role;

do $$
begin
  if not exists (
    select 1
    from public.solicitacoes
    where livro_id = '50000000-0000-0000-0000-000000000001'
      and nome_solicitante = 'Solicitante público'
      and telefone_solicitante = '11988887777'
      and status = 'pendente'
  ) then
    raise exception 'Solicitação pública válida não foi persistida como pendente.';
  end if;
end;
$$;

rollback;
