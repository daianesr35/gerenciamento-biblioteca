# Banco de Dados

## Objetivo

Registrar a infraestrutura, a estratégia de versionamento e, nas próximas
tarefas da Etapa 5, o modelo persistente do sistema.

## Status

A Tarefa 5.1 preparou a infraestrutura local e versionada do Supabase. A Tarefa
5.2 iniciou o modelo persistente com Proprietário e Biblioteca. A Tarefa 5.3
acrescentou exclusivamente o catálogo de livros pertencente à Biblioteca.
A Tarefa 5.4 acrescentou Solicitação e Empréstimo, incluindo o vínculo opcional
entre um empréstimo efetivo e a solicitação que o originou. A Tarefa 5.5
vinculou Proprietário a `auth.users`, habilitou RLS nas cinco tabelas do domínio,
isolou os dados por Proprietário e criou o acesso público mínimo por funções
RPC. Autenticação funcional, operações transacionais de empréstimo e os demais
recursos da interface continuam reservados às tarefas futuras.

## Entidades

### Proprietário

Representa a pessoa responsável por gerenciar uma única biblioteca pessoal.

Responsabilidades conceituais:

- identificar o responsável pela biblioteca;
- manter o nome e o e-mail exigidos pela SDD;
- ser a origem da propriedade e do isolamento futuro dos dados.

| Atributo          | Representação | Nulabilidade | Observação                                |
| ----------------- | ------------- | ------------ | ----------------------------------------- |
| `id`              | `uuid`        | obrigatório  | chave primária gerada pelo banco          |
| `usuario_auth_id` | `uuid`        | obrigatório  | referência única a `auth.users.id`        |
| `nome`            | `text`        | obrigatório  | não aceita valor vazio ou somente espaços |
| `email`           | `text`        | obrigatório  | chave candidata e valor único             |

A senha prevista pela SDD é uma credencial de autenticação e não é armazenada
em `proprietarios`. `usuario_auth_id` representa somente o vínculo estrutural
necessário às policies; credenciais, cadastro, login, sessão e logout continuam
reservados à Etapa 6. A restrição única garante a relação 1:1 entre uma
identidade autenticada e um Proprietário, e a chave estrangeira impede vínculo
com usuário inexistente.

### Biblioteca

Representa a biblioteca pessoal pertencente a um único Proprietário.

Responsabilidades conceituais:

- delimitar o acervo que pertencerá ao Proprietário;
- possuir identidade interna própria;
- possuir um identificador público estável e exclusivo;
- servir de destino conceitual do QR Code futuro.

| Atributo                | Representação | Nulabilidade | Observação                                          |
| ----------------------- | ------------- | ------------ | --------------------------------------------------- |
| `id`                    | `uuid`        | obrigatório  | chave primária gerada pelo banco                    |
| `proprietario_id`       | `uuid`        | obrigatório  | chave estrangeira e candidata no relacionamento 1:1 |
| `identificador_publico` | `uuid`        | obrigatório  | chave candidata, única e gerada pelo banco          |

O QR Code é conceitualmente a representação codificada do destino formado a
partir do `identificador_publico`. A imagem, a URL canônica e a geração do QR
Code não são persistidas nem implementadas nesta tarefa e permanecem reservadas
à etapa funcional correspondente.

### Livro

Representa um livro catalogado em uma Biblioteca. Cada registro corresponde a
um item do acervo cuja disponibilidade será usada pelos fluxos futuros.

Responsabilidades conceituais:

- manter os dados bibliográficos exigidos pela SDD;
- pertencer obrigatoriamente a uma Biblioteca;
- representar apenas as situações Disponível ou Emprestado;
- fornecer a referência persistente para Solicitações e Empréstimos.

| Atributo        | Representação | Nulabilidade | Observação                                                         |
| --------------- | ------------- | ------------ | ------------------------------------------------------------------ |
| `id`            | `uuid`        | obrigatório  | chave primária gerada pelo banco                                   |
| `biblioteca_id` | `uuid`        | obrigatório  | chave estrangeira para `bibliotecas.id`                            |
| `isbn`          | `text`        | opcional     | permite ISBN-10, ISBN-13 e formatos revisados pelo cadastro futuro |
| `titulo`        | `text`        | obrigatório  | não aceita valor vazio ou somente espaços                          |
| `autor`         | `text`        | obrigatório  | aceita a representação textual de um ou mais autores               |
| `editora`       | `text`        | opcional     | quando informado, não aceita valor vazio                           |
| `imagem_capa`   | `text`        | opcional     | referência textual da imagem obtida futuramente; não há upload     |
| `situacao`      | `text`        | obrigatório  | `disponivel` ou `emprestado`; padrão `disponivel`                  |

`isbn` é opcional porque a SDD preserva o cadastro manual quando não houver
consulta bem-sucedida à Google Books. Ele não é chave candidata: uma mesma
Biblioteca pode possuir mais de um exemplar da mesma edição, e bibliotecas
distintas podem catalogar o mesmo ISBN. Nesta etapa, `id` é a única chave
candidata de Livro.

`editora` e `imagem_capa` são opcionais para não tornar o serviço externo uma
dependência do cadastro manual. A coluna `imagem_capa` apenas reserva o dado
exigido pela SDD; obtenção, validação de URL e uso da imagem pertencem às etapas
funcionais posteriores.

### Solicitação

Representa o pedido público de empréstimo de exatamente um Livro. Solicitação e
Empréstimo são entidades distintas porque uma solicitação pode ser recusada sem
produzir empréstimo e a SDD também permite que o Proprietário registre um
empréstimo diretamente.

Responsabilidades conceituais:

- identificar o Livro solicitado;
- armazenar nome e telefone informados pelo solicitante;
- registrar a data da solicitação;
- representar somente os estados Pendente, Confirmada ou Recusada;
- ser a origem opcional de um único Empréstimo efetivo.

| Atributo               | Representação | Nulabilidade | Observação                                                  |
| ---------------------- | ------------- | ------------ | ----------------------------------------------------------- |
| `id`                   | `uuid`        | obrigatório  | chave primária gerada pelo banco                            |
| `livro_id`             | `uuid`        | obrigatório  | chave estrangeira para `livros.id`                          |
| `nome_solicitante`     | `text`        | obrigatório  | não aceita valor vazio ou somente espaços                   |
| `telefone_solicitante` | `text`        | obrigatório  | não aceita valor vazio ou somente espaços                   |
| `data_solicitacao`     | `timestamptz` | obrigatório  | instante da criação; padrão definido pelo banco com `now()` |
| `status`               | `text`        | obrigatório  | `pendente`, `confirmada` ou `recusada`; padrão `pendente`   |

O telefone permanece textual e sem regra de formato, pois a SDD exige o dado,
mas não define máscara, país ou normalização. Uma Solicitação pertence à
Biblioteca de forma transitiva pelo Livro; não existe `biblioteca_id` duplicado
na tabela.

A restrição auxiliar única sobre `(id, livro_id)` permite que o vínculo de
Empréstimo valide no próprio banco que uma solicitação e seu empréstimo apontam
para o mesmo Livro. Ela não representa uma nova chave candidata mínima, porque
`id` já identifica sozinho a Solicitação.

### Empréstimo

Representa o empréstimo efetivamente realizado, seja por confirmação de uma
Solicitação, seja por registro direto do Proprietário.

Responsabilidades conceituais:

- identificar o Livro emprestado;
- armazenar nome e telefone do solicitante no registro efetivo;
- registrar a data do empréstimo;
- registrar opcionalmente a data da devolução;
- vincular-se opcionalmente à Solicitação confirmada que o originou;
- preservar a distinção entre empréstimos ativos e devolvidos pela nulabilidade
  de `data_devolucao`.

| Atributo               | Representação | Nulabilidade | Observação                                                            |
| ---------------------- | ------------- | ------------ | --------------------------------------------------------------------- |
| `id`                   | `uuid`        | obrigatório  | chave primária gerada pelo banco                                      |
| `livro_id`             | `uuid`        | obrigatório  | chave estrangeira para `livros.id`                                    |
| `solicitacao_id`       | `uuid`        | opcional     | vínculo único com a Solicitação de origem; nulo no registro direto    |
| `nome_solicitante`     | `text`        | obrigatório  | não aceita valor vazio ou somente espaços                             |
| `telefone_solicitante` | `text`        | obrigatório  | não aceita valor vazio ou somente espaços                             |
| `data_emprestimo`      | `timestamptz` | obrigatório  | instante do empréstimo; padrão definido pelo banco com `now()`        |
| `data_devolucao`       | `timestamptz` | opcional     | nulo enquanto ativo; quando informado, não antecede `data_emprestimo` |

Nome e telefone permanecem no Empréstimo mesmo quando existe Solicitação de
origem. Isso torna o registro direto completo e preserva o fato histórico do
empréstimo. A futura confirmação transacional será responsável por copiar os
dados de forma consistente; nenhuma automação foi antecipada.

O par `(solicitacao_id, livro_id)` é único quando a Solicitação é informada.
Como cada Solicitação já está vinculada a um único Livro, essa restrição impede
que ela origine mais de um Empréstimo e também cobre o acesso da chave
estrangeira composta. Como `solicitacao_id` é opcional, o par não constitui
chave candidata de todos os registros de Empréstimo; `id` permanece a única
chave candidata.

## Relacionamentos

### Proprietário — Biblioteca

- cada Biblioteca pertence obrigatoriamente a exatamente um Proprietário;
- cada Proprietário pode estar associado a no máximo uma Biblioteca;
- a chave estrangeira `bibliotecas.proprietario_id` referencia
  `proprietarios.id`;
- a unicidade de `bibliotecas.proprietario_id` materializa o relacionamento 1:1;
- a existência obrigatória de uma Biblioteca para todo Proprietário dependerá
  do fluxo transacional de cadastro da Etapa 6, pois uma chave estrangeira
  isolada não impõe a participação mínima no lado do Proprietário.

```text
Proprietário (1) ---- (0..1) Biblioteca
Biblioteca    (1) ---- (1)    Proprietário
```

### Biblioteca — Livro

- cada Livro pertence obrigatoriamente a exatamente uma Biblioteca;
- cada Biblioteca pode possuir zero ou muitos Livros;
- a chave estrangeira `livros.biblioteca_id` referencia `bibliotecas.id`;
- a exclusão de uma Biblioteca referenciada é restringida para impedir Livros
  órfãos;
- a exclusão e o ciclo de vida do catálogo serão definidos pelo futuro caso de
  uso, sem cascata implícita nesta etapa.

```text
Biblioteca (1) ---- (0..N) Livro
Livro      (1) ---- (1)    Biblioteca
```

### Livro — Solicitação

- cada Solicitação pertence obrigatoriamente a exatamente um Livro;
- cada Livro pode possuir zero ou muitas Solicitações ao longo do tempo;
- a chave estrangeira `solicitacoes.livro_id` referencia `livros.id`;
- a exclusão de Livro referenciado é restringida;
- várias solicitações para o mesmo Livro continuam estruturalmente possíveis,
  pois a SDD não define reserva, fila ou unicidade de solicitação pendente.

```text
Livro       (1) ---- (0..N) Solicitação
Solicitação (1) ---- (1)    Livro
```

### Livro — Empréstimo

- cada Empréstimo pertence obrigatoriamente a exatamente um Livro;
- cada Livro pode possuir zero ou muitos Empréstimos ao longo do tempo;
- a chave estrangeira `emprestimos.livro_id` referencia `livros.id`;
- a exclusão de Livro referenciado é restringida;
- a existência de no máximo um empréstimo ativo por Livro dependerá da futura
  operação transacional, pois concorrência foi excluída do escopo da Tarefa 5.4.

```text
Livro       (1) ---- (0..N) Empréstimo
Empréstimo  (1) ---- (1)    Livro
```

### Solicitação — Empréstimo

- uma Solicitação pode originar zero ou um Empréstimo;
- um Empréstimo pode ter zero ou uma Solicitação de origem;
- `emprestimos.solicitacao_id` nulo representa um registro direto;
- a unicidade de
  `(emprestimos.solicitacao_id, emprestimos.livro_id)` impede mais de um
  Empréstimo para a mesma Solicitação;
- a chave estrangeira composta
  `(emprestimos.solicitacao_id, emprestimos.livro_id)` garante que, quando
  houver Solicitação, os dois registros referenciem o mesmo Livro;
- a exclusão da Solicitação vinculada é restringida.

```text
Solicitação (0..1) ---- (0..1) Empréstimo
```

## Restrições

- chaves primárias UUID identificam todas as entidades sem depender de atributos
  mutáveis;
- `nome` e `email` são obrigatórios e não aceitam texto vazio;
- `email` é único e constitui a chave candidata natural do Proprietário;
- `proprietario_id` é obrigatório e único, impedindo Biblioteca sem
  Proprietário ou mais de uma Biblioteca para o mesmo Proprietário;
- `identificador_publico` é obrigatório e único, sustentando a exigência de um
  QR Code exclusivo por Biblioteca sem implementar o QR Code;
- a exclusão de um Proprietário referenciado é restringida para impedir uma
  Biblioteca órfã;
- a regra de que todo Proprietário deve possuir uma Biblioteca será garantida
  pelo futuro caso de uso transacional de cadastro;
- normalização e comparação de e-mail e ciclo funcional de exclusão de conta
  permanecem pendentes para a Etapa 6;
- `usuario_auth_id` é obrigatório, único e referencia `auth.users.id` com
  exclusão restringida;
- todo Livro possui Biblioteca existente, título e autor não vazios;
- ISBN, editora e imagem da capa podem ser nulos, mas não podem ser texto vazio
  quando informados;
- a situação é obrigatória, inicia como `disponivel` e aceita somente
  `disponivel` ou `emprestado`;
- o ISBN não é único, permitindo exemplares da mesma edição e o mesmo título em
  Bibliotecas distintas;
- nenhuma regra de transição entre situações foi implementada: confirmação,
  empréstimo e devolução pertencem às tarefas posteriores.
- toda Solicitação referencia um Livro existente e possui nome, telefone, data e
  status;
- nome e telefone de Solicitação não aceitam texto vazio;
- Solicitação inicia como `pendente` e aceita somente `pendente`, `confirmada`
  ou `recusada`;
- todo Empréstimo referencia um Livro existente e possui nome, telefone e data
  do empréstimo;
- nome e telefone de Empréstimo não aceitam texto vazio;
- a data da devolução é opcional e, quando informada, não pode anteceder a data
  do empréstimo;
- cada Solicitação pode ser vinculada a no máximo um Empréstimo;
- um Empréstimo vinculado e sua Solicitação obrigatoriamente referenciam o mesmo
  Livro;
- confirmação exige Solicitação confirmada, cópia consistente dos dados, mudança
  da situação do Livro e criação do Empréstimo em operação transacional futura;
- devolução, prevenção de empréstimos ativos concorrentes e atualização
  automática de `livros.situacao` não foram implementadas nesta tarefa.

## Índices

Além dos índices implícitos das chaves primárias e restrições de unicidade, a
Tarefa 5.3 criou `livros_biblioteca_id_idx`. Ele sustenta a consulta fundamental
do catálogo por Biblioteca e as verificações da chave estrangeira no lado
referenciado. Nenhum índice de busca textual, ISBN ou situação foi antecipado.

A Tarefa 5.4 criou:

- `solicitacoes_livro_id_idx`, para o relacionamento e a consulta das
  Solicitações de um Livro;
- `emprestimos_livro_id_idx`, para o relacionamento, o histórico e a consulta
  dos Empréstimos de um Livro.

As restrições únicas criam automaticamente os índices necessários ao vínculo
por Solicitação. Não foram antecipados índices por status ou datas, porque os
padrões reais de consulta serão implementados nas etapas funcionais.

## Políticas de Segurança (RLS)

### Princípio

A Tarefa 5.5 adotou negação por padrão e liberação mínima. RLS está habilitada
em `proprietarios`, `bibliotecas`, `livros`, `solicitacoes` e `emprestimos`.
Não existem policies com `USING (true)` ou `WITH CHECK (true)`.

O vínculo de autorização parte de:

```text
auth.uid()
  → proprietarios.usuario_auth_id
  → bibliotecas.proprietario_id
  → livros.biblioteca_id
  → solicitacoes.livro_id / emprestimos.livro_id
```

### Policies privadas

O papel `authenticated` possui policies separadas de `SELECT`, `INSERT`,
`UPDATE` e `DELETE` em cada tabela:

- Proprietário: `usuario_auth_id` deve ser igual a `auth.uid()`;
- Biblioteca: o Proprietário relacionado deve corresponder a `auth.uid()`;
- Livro: a Biblioteca relacionada deve pertencer ao Proprietário autenticado;
- Solicitação: o Livro relacionado deve pertencer à Biblioteca autenticada;
- Empréstimo: o Livro relacionado deve pertencer à Biblioteca autenticada.

Policies de `UPDATE` usam simultaneamente `USING` sobre a linha existente e
`WITH CHECK` sobre a nova linha. Assim, não é possível transferir Proprietário,
Biblioteca, Livro, Solicitação ou Empréstimo para outro domínio por alteração de
chave estrangeira. `INSERT` usa `WITH CHECK`; leitura e exclusão usam `USING`.

### Acesso público mínimo

`anon` não possui privilégio direto sobre nenhuma tabela do domínio e não
possui policy de tabela. O fluxo público usa quatro funções:

- `localizar_biblioteca_publica(uuid)`: informa somente se o identificador
  público exato corresponde a uma Biblioteca;
- `obter_nome_proprietario_publico(uuid)`: retorna somente o nome do
  Proprietário vinculado ao identificador público exato, para identificação no
  banner da Página Pública;
- `listar_livros_publicos(uuid)`: retorna somente `id`, `isbn`, `titulo`,
  `autor`, `editora` e `imagem_capa` de Livros com situação `disponivel` da
  Biblioteca indicada;
- `criar_solicitacao_publica(uuid, uuid, text, text)`: aceita apenas
  identificador da Biblioteca, Livro, nome e telefone; valida Biblioteca,
  pertencimento e disponibilidade, remove espaços externos e define no banco o
  identificador, a data e o status `pendente`.

Não foi criada view pública. Uma view ou `SELECT` direto exigiria expor uma
relação enumerável ou mais colunas do que o fluxo necessita. As funções
recebem obrigatoriamente o identificador público e reduzem campos e operações.

As três funções são `SECURITY DEFINER` estritamente para acessar as tabelas sem
concedê-las a `anon`. Elas usam `search_path = ''`, qualificam todos os objetos,
possuem assinaturas tipadas e tiveram `EXECUTE` revogado de `PUBLIC` e
`authenticated`; somente `anon` recebeu execução.

### Grants

- `authenticated`: `SELECT`, `INSERT`, `UPDATE` e `DELETE` nas cinco tabelas,
  sempre limitados por RLS;
- `anon`: nenhum privilégio de tabela;
- `anon`: `EXECUTE` somente nas três funções públicas;
- `PUBLIC` e `authenticated`: sem `EXECUTE` nessas funções.

Não foram usados `service_role`, credenciais, claims editáveis de
`user_metadata`, policies genéricas ou funções auxiliares internas.

### Exclusão privada transacional

A migration `20260803035809_permitir_exclusao_de_livro_devolvido.sql` adiciona
a RPC `excluir_livro_privado(uuid)`. A função valida `auth.uid()` e a
propriedade do Livro, bloqueia a exclusão quando existe Empréstimo ativo e,
quando o Livro está disponível, remove Solicitações e Empréstimos encerrados
relacionados antes de excluir o Livro na mesma transação. Assim, um Livro já
devolvido pode ser excluído sem deixar registros dependentes.

O `EXECUTE` foi revogado de `PUBLIC` e `anon` e concedido somente a
`authenticated`; as validações internas de propriedade permanecem obrigatórias.

### Testes de segurança

`supabase/tests/rls_e_acesso_publico.sql` cria dois usuários, dois
Proprietários, duas Bibliotecas e dados relacionados dentro de uma transação.
O teste simula `authenticated` e `anon`, valida acessos positivos e negativos,
tentativas de transferência de vínculo, criação pública válida e bloqueios de
leitura e mutação públicas. O arquivo sempre termina com `rollback`, sem
persistir dados.

## Migrações

### Infraestrutura

- CLI do Supabase fixada como dependência de desenvolvimento em `package.json`;
- configuração local versionada em `supabase/config.toml`;
- migrations habilitadas e armazenadas em `supabase/migrations`;
- seeds desabilitados enquanto não houver necessidade aprovada;
- nenhuma conexão com projeto remoto configurada.

O ambiente local requer Node.js 22+, as dependências instaladas e um runtime
Docker compatível em execução. Os comandos usam a versão local da CLI, sem
depender de instalação global.

### Criar uma migration

1. Iniciar o stack local com `npm run db:start`.
2. Executar `npm run db:migration:new -- <nome_descritivo>`.
3. Editar apenas o SQL criado pela CLI em `supabase/migrations`, cujo nome segue
   `<timestamp>_<nome>.sql`.
4. Revisar o SQL e confirmar que ele contém somente o escopo da tarefa ativa.
5. Executar `npm run db:reset` para reconstruir o banco local desde o zero.
6. Executar `npm run db:migrations:list` para conferir o histórico local.

Arquivos de migration não devem ter nomes ou timestamps criados manualmente. O
fluxo declarativo experimental da CLI não será adotado enquanto permanecer em
alpha; a estratégia atual usa migrations SQL imperativas e explícitas.

### Aplicar e validar

- `npm run db:start`: inicia o stack local e aplica a configuração;
- `npm run db:reset`: descarta o banco local, recria-o e aplica, em ordem, todas
  as migrations versionadas;
- `npm run db:migrations:list`: compara os arquivos locais com o histórico do
  banco local;
- `npm run db:stop`: encerra o stack local preservando o estado por padrão.

Uma migration só estará pronta quando um `db:reset` completo passar em ambiente
limpo e as verificações específicas de schema, integridade e segurança da
tarefa correspondente forem aprovadas.

Para repetir os testes de RLS no ambiente local:

```powershell
Get-Content supabase/tests/rls_e_acesso_publico.sql -Raw |
  docker exec -i supabase_db_gerenciamento-biblioteca `
  psql -v ON_ERROR_STOP=1 -U postgres -d postgres
```

O nome do contêiner deriva do nome local do projeto e deve ser confirmado com
`docker ps` quando o diretório for renomeado.

### Ambiente remoto

Esta tarefa não vinculou nem alterou projeto remoto. Quando um ambiente remoto
for autorizado, o fluxo previsto será:

1. autenticar a CLI fora do repositório;
2. vincular explicitamente o ambiente correto;
3. comparar o histórico local e remoto;
4. aplicar migrations pendentes com `supabase db push`;
5. verificar o histórico e executar as validações pós-aplicação.

Tokens, senhas e identificadores locais de vínculo não devem ser versionados.
Aplicações remotas destrutivas, incluindo `db reset --linked`, não fazem parte
do fluxo normal e exigem autorização explícita.

### Correção e reversão

A estratégia é **forward-only** para migrations compartilhadas ou aplicadas:
elas não são editadas nem removidas. Uma correção é criada com
`npm run db:migration:new -- <correcao_descritiva>` e testada por reconstrução
completa.

Durante o desenvolvimento local, uma migration ainda não compartilhada pode ser
ajustada antes da validação final, seguida de `npm run db:reset`. Em ambientes
compartilhados, reversão de schema ou dados deverá ser uma nova migration
compensatória, revisada e testada. `supabase migration repair` altera somente o
histórico e será reservado a divergências comprovadas; não substitui SQL de
reversão nem será usado sem análise e autorização.

### Variáveis e segredos

O cliente público continua usando exclusivamente
`NEXT_PUBLIC_SUPABASE_URL` e
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, centralizadas em
`src/config/env.ts` e exemplificadas com valores fictícios em `.env.example`.
Chaves secretas, `service_role`, senha do banco e token da CLI não pertencem ao
cliente nem ao repositório. O cliente de servidor continua reservado à Etapa 6.

## Histórico de Alterações

- **Tarefa 5.1:** infraestrutura Supabase local, diretório de migrations,
  comandos operacionais e estratégia de aplicação/correção preparados, sem
  criação do modelo definitivo.
- **Tarefa 5.2:** modelagem conceitual e primeira migration de Proprietário e
  Biblioteca, com chaves, relacionamento 1:1 e restrições de integridade.
- **Tarefa 5.3:** entidade Livro, relacionamento Biblioteca 1:N, dados
  bibliográficos, situação restrita e índice do catálogo por Biblioteca.
- **Tarefa 5.4:** entidades Solicitação e Empréstimo, relacionamentos com Livro,
  vínculo opcional 1:1 entre Solicitação e Empréstimo, estados e datas
  estruturais, sem automações ou regras transacionais.
- **Tarefa 5.5:** vínculo único com `auth.users`, RLS e policies por operação nas
  cinco tabelas, grants mínimos e três RPCs para localização, catálogo
  disponível e criação pública de Solicitação pendente.

# Gerenciamento privado das solicitações

A migration `20260730150000_gerenciar_solicitacoes_privadas.sql` adiciona as
RPCs privadas mínimas `confirmar_solicitacao_privada(uuid)` e
`recusar_solicitacao_privada(uuid)`. A confirmação bloqueia a solicitação e o
livro, exige solicitação pendente e livro disponível e altera ambos
atomicamente. A recusa altera somente uma solicitação pendente.

O `EXECUTE` foi revogado de `PUBLIC` e `anon` e concedido somente a
`authenticated`. Ambas validam `auth.uid()` e a propriedade internamente. As
tabelas continuam com RLS habilitada e nenhum registro em `emprestimos` é criado.
