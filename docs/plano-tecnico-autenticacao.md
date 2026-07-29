# Plano técnico de autenticação — Etapa 6

## 1. Finalidade e escopo

Este documento registra a inspeção e a definição técnica da Etapa 6 —
Autenticação. Ele complementa, sem substituir:

- `docs/SDD-sistema.md`, fonte oficial dos requisitos funcionais;
- `docs/plano-de-implementacao.md`, roteiro incremental do projeto;
- `docs/arquitetura.md`, fronteiras entre interface, serviços e dados;
- `docs/banco-de-dados.md`, modelo, migrations, RLS e grants;
- `docs/estado-do-projeto.md`, estado consolidado até a Etapa 5.

Esta tarefa não implementa cadastro, login, sessão, proteção de rotas ou logout.
Também não altera código funcional, configuração do Supabase ou migrations.

## 2. Estado inicial do repositório

| Item                       | Resultado inspecionado                                                      |
| -------------------------- | --------------------------------------------------------------------------- |
| Branch                     | `main`, acompanhando `origin/main`                                          |
| Último commit              | `810757f feat(database): concluir etapa 5 - modelagem do banco e segurança` |
| Árvore de trabalho         | limpa no início da tarefa                                                   |
| `git diff --check` inicial | aprovado, sem saída e código 0                                              |
| Migrations                 | quatro arquivos, com os mesmos nomes da SDD de encerramento da Etapa 5      |
| Divergências anteriores    | nenhuma alteração versionada ou não rastreada encontrada                    |

O repositório corresponde à SDD de encerramento da Etapa 5: a interface continua
simulada, as quatro migrations estão presentes, RLS e RPCs públicas estão
versionadas e não há autenticação funcional, cliente Supabase de servidor,
cookies de sessão, proxy ou middleware.

## 3. Estrutura e dependências encontradas

### 3.1 Rotas e layouts

```text
src/app/
├── layout.tsx
├── page.tsx
├── login/page.tsx
├── reference-image/[name]/route.ts
└── (private)/
    ├── layout.tsx
    ├── dashboard/page.tsx
    ├── biblioteca/page.tsx
    ├── livros/novo/page.tsx
    ├── livros/[id]/page.tsx
    ├── livros/[id]/editar/page.tsx
    ├── solicitacoes/page.tsx
    ├── emprestimos/page.tsx
    ├── pagina-publica/page.tsx
    ├── configuracoes/page.tsx
    └── perfil/page.tsx
```

- O layout raiz somente define metadados, idioma e estilos globais.
- O layout `(private)` somente envolve as páginas em `AppShell`; o nome do grupo
  não protege as URLs.
- `/` redireciona incondicionalmente para `/dashboard`.
- Não existe rota `/cadastro`.
- `/pagina-publica` é uma prévia administrativa dentro da área privada. Não é a
  futura rota pública da biblioteca.
- `reference-image/[name]` serve imagens locais permitidas por uma lista fixa e
  não participa do fluxo de autenticação.

### 3.2 Server e Client Components

São Client Components as páginas que mantêm interações visuais locais, entre
elas Login, Biblioteca, Solicitações, Empréstimos, Configurações, Perfil e
Página Pública, além de `AppShell`. Dashboard, detalhes de Livro, layouts e a
rota raiz são Server Components ou handlers por padrão.

A proteção futura deve ocorrer antes ou durante a renderização no servidor. A
presença de Client Components não autoriza confiar em estado do navegador para
proteger identidade ou dados.

### 3.3 Interface relacionada à autenticação

- `src/app/login/page.tsx`: formulário visual com validação HTML de e-mail e
  presença de senha; quando válido, executa apenas `router.push('/dashboard')`.
- Cadastro: ausente.
- `src/components/app-shell.tsx`: nome, iniciais e papel da proprietária estão
  fixos como “Daiane Ribeiro”, “DR” e “Proprietária”.
- `src/app/(private)/perfil/page.tsx`: nome e e-mail fixos, salvamento e
  alteração de senha simulados; contém campos fora da SDD, que não devem ser
  integrados nesta etapa.
- `src/app/(private)/configuracoes/page.tsx`: resumo estático da conta e ações
  simuladas.
- Logout: não existe botão, serviço ou comportamento.
- Recuperação de senha: aparece apenas como indisponível e continua fora do
  escopo da SDD.

### 3.4 Camadas, mocks e configuração

- `src/components`: `AppShell`, cards e controles visuais reutilizáveis.
- `src/services`: somente README; nenhum caso de uso funcional.
- `src/data/supabase/client.ts`: singleton preguiçoso de navegador criado com
  `@supabase/supabase-js`.
- `src/data/mock/library.ts`: livros, solicitações e empréstimos simulados.
- `src/types`: somente README; não há contratos de autenticação.
- `src/config/env.ts`: valida `NEXT_PUBLIC_APP_URL`,
  `NEXT_PUBLIC_SUPABASE_URL` e
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- `.env.example`: contém apenas exemplos públicos e não contém segredo.
- Não existe `middleware.ts`, `proxy.ts` ou cliente Supabase de servidor.
- Não há dado mock central de usuário: os dados de perfil estão escritos
  diretamente em `AppShell`, Perfil, Configurações e Página Pública.

Os mocks de catálogo e operações posteriores devem permanecer conectados às
telas durante a Etapa 6. Somente identidade, sessão e dados mínimos de
Proprietário/Biblioteca pertencem à autenticação.

### 3.5 Dependências

| Dependência             |    Versão | Impacto                           |
| ----------------------- | --------: | --------------------------------- |
| Next.js                 | `16.2.12` | App Router e convenção `proxy.ts` |
| React / React DOM       |  `19.2.8` | interface                         |
| TypeScript              |   `5.9.3` | modo estrito                      |
| `@supabase/supabase-js` | `2.110.9` | cliente Auth/Data API existente   |
| Supabase CLI            | `2.110.0` | stack e migrations locais         |
| Vitest                  |  `4.1.10` | testes unitários                  |

`@supabase/ssr` não está instalado. Também não há React Hook Form, Formik, Zod,
Valibot, Yup, biblioteca equivalente de formulários/validação ou ferramenta
E2E. A validação atual usa recursos nativos do navegador. Nenhuma dependência
foi instalada ou atualizada nesta tarefa.

O inventário de `npm ls --depth=0` também apresentou pacotes transitivos de
WASM/Sharp como extraneous. Eles não são dependências declaradas e não afetam a
definição de autenticação; não foram removidos por estarem fora do escopo.

## 4. Banco relacionado à autenticação

### 4.1 Estrutura

```text
auth.users.id
  └── public.proprietarios.usuario_auth_id (NOT NULL, UNIQUE, FK, ON DELETE RESTRICT)
        └── public.bibliotecas.proprietario_id (NOT NULL, UNIQUE, FK, ON DELETE RESTRICT)
```

`proprietarios` exige:

- `id uuid` com `gen_random_uuid()` e chave primária;
- `usuario_auth_id uuid` obrigatório, único e referenciando `auth.users.id`;
- `nome text` obrigatório e não vazio após `btrim`;
- `email text` obrigatório, não vazio e único.

`bibliotecas` exige:

- `id uuid` com `gen_random_uuid()` e chave primária;
- `proprietario_id uuid` obrigatório, único e referenciando
  `proprietarios.id`;
- `identificador_publico uuid` obrigatório, gerado pelo banco e único.

A senha existe somente no Supabase Auth. Ela não deve ser copiada para
`public.proprietarios`, logs, metadados ou estado persistente da aplicação.

### 4.2 Funções, triggers e RPCs existentes

Não existe trigger, função ou RPC para criar o Proprietário e a Biblioteca
inicial. Também não existe sincronização automática de nome ou e-mail.

As únicas RPCs existentes são públicas e pertencem às etapas futuras:

- `localizar_biblioteca_publica(uuid)`;
- `listar_livros_publicos(uuid)`;
- `criar_solicitacao_publica(uuid, uuid, text, text)`.

Elas são `SECURITY DEFINER`, usam `search_path = ''`, tiveram execução revogada
de `PUBLIC` e `authenticated` e são executáveis somente por `anon`. Nenhuma
delas deve ser reutilizada para autenticação.

### 4.3 RLS e grants

RLS está ativa nas cinco tabelas do domínio. `authenticated` possui privilégios
de tabela para CRUD, sempre limitados pelas policies. `anon` não possui
privilégio direto de tabela.

Para Proprietário, `auth.uid()` deve ser igual a `usuario_auth_id`. Para
Biblioteca e demais entidades, a propriedade é verificada transitivamente pelo
Proprietário. Policies de atualização combinam `USING` e `WITH CHECK`, impedindo
transferência de vínculo.

Consequências para a Etapa 6:

- uma sessão autenticada pode ler e atualizar apenas o próprio Proprietário;
- a mesma sessão pode acessar apenas a Biblioteca vinculada ao seu Proprietário;
- uma requisição sem sessão não acessa nenhuma tabela privada;
- o frontend usa somente chave publicável; `service_role` não é necessário nem
  permitido;
- `user_metadata` não participa das policies nem de autorização;
- proxy e layouts melhoram navegação, mas RLS continua sendo a barreira efetiva
  contra acesso cruzado.

### 4.4 Risco de criação parcial

Com o schema atual, três chamadas independentes — `auth.signUp`, insert em
`proprietarios` e insert em `bibliotecas` — não formam uma transação única.
Esse desenho poderia deixar:

- usuário Auth sem Proprietário;
- Proprietário sem Biblioteca;
- uma repetição que colide com constraints únicas;
- impossibilidade de provisionar o perfil antes da confirmação de e-mail, pois
  nesse modo `signUp` retorna usuário sem sessão.

Portanto, a implementação não deve fazer os dois inserts públicos
sequencialmente no frontend.

## 5. Estratégia técnica definida

### 5.1 Clientes Supabase e cookies

Na Tarefa 6.2 deve ser adicionada uma versão fixa de `@supabase/ssr`, mantendo
`@supabase/supabase-js`. Serão necessários:

- cliente de navegador criado com `createBrowserClient`, singleton por aba;
- cliente de servidor criado por requisição com `createServerClient` e a API
  assíncrona `cookies()` do Next.js;
- utilitário exclusivo do Proxy capaz de copiar todos os cookies atualizados
  para a requisição e para a resposta.

As sessões SSR usarão cookies e fluxo PKCE. O próprio pacote deve controlar os
nomes e a rotação dos tokens; a aplicação não deve criar um segundo formato de
sessão nem armazenar tokens manualmente.

Server Components não conseguem persistir cookies durante renderização. Em
Next.js 16, o ponto de renovação deve ser `src/proxy.ts`, não
`middleware.ts`. O Proxy chamará o método recomendado pelo Supabase para
validar/renovar a identidade e propagará `Set-Cookie`.

Não se deve confiar em `getSession()` para autorizar uma requisição de servidor,
pois ele apenas lê o armazenamento. A proteção deve validar a identidade por
`getClaims()` quando compatível com as chaves do projeto, com `getUser()` como
validação remota quando for necessário estado atual ou compatibilidade. A
decisão final do método deve ser coberta por teste local e remoto sem duplicar
renovação entre Proxy e Server Components.

Rotas autenticadas devem ser dinâmicas e não podem usar ISR/cache compartilhado
em respostas que leem ou renovam sessão.

### 5.2 Proteção e redirecionamentos

O Proxy fará renovação e redirecionamentos antecipados, mas não será a única
verificação. O layout privado também validará a identidade no servidor antes de
renderizar `AppShell`. Server Actions e futuros serviços de dados validarão o
usuário e continuarão sujeitos ao RLS.

Classificação proposta:

| Classe                   | Rotas                                                                                                                      |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Visitante                | `/login`, futura `/cadastro`                                                                                               |
| Protegida                | `/dashboard`, `/biblioteca`, `/livros/**`, `/solicitacoes`, `/emprestimos`, `/pagina-publica`, `/configuracoes`, `/perfil` |
| Entrada condicional      | `/`, redireciona para Dashboard ou Login conforme a sessão                                                                 |
| Pública técnica          | `/reference-image/[name]`                                                                                                  |
| Pública funcional futura | rota por `identificador_publico`, somente na Etapa 9                                                                       |

Comportamentos:

- visitante sem sessão em rota protegida: `/login?next=<caminho-seguro>`;
- usuário autenticado em Login ou Cadastro: `/dashboard`;
- login bem-sucedido: destino `next` interno validado ou `/dashboard`;
- cadastro com sessão imediata: `/dashboard`;
- logout: `/login`;
- parâmetros `next` só aceitam caminhos internos conhecidos, evitando open
  redirect.

É recomendável mover Login e Cadastro para um grupo `(auth)` sem mudar suas
URLs. O grupo `(private)` atual pode ser preservado. Essa reorganização só será
feita na tarefa que implementar as telas.

### 5.3 Camadas e responsabilidades

```text
Página/formulário
  → Server Action da rota
    → serviço de autenticação
      → adaptador Supabase Auth
        → Supabase Auth / trigger de provisionamento
```

- `src/app`: composição, Server Actions, estados de envio e redirecionamento;
- `src/components`: campos e feedback, sem import de Supabase;
- `src/services`: validação de caso de uso, normalização e tradução de erros;
- `src/data/supabase`: clientes e chamadas ao provedor;
- `src/types`: contratos compartilhados de entrada e resultado;
- banco: integridade, criação atômica do perfil/biblioteca e RLS.

Server Actions são adequadas a Cadastro, Login e Logout porque integram
formulários, cookies e redirecionamento no mesmo projeto. Route Handler deve ser
criado somente se a confirmação por e-mail/PKCE exigir callback HTTP. A
interface não chamará Supabase diretamente.

### 5.4 Formulários e erros

Nesta etapa não há necessidade comprovada de biblioteca de formulário. A
implementação pode usar formulários nativos, Server Actions e funções puras de
validação testáveis. Se a complexidade real crescer, uma biblioteca só deve ser
adicionada com justificativa e versão fixa.

Regras mínimas:

- `nome`: `trim`, obrigatório e não vazio;
- `email`: `trim`, normalização consistente e formato válido;
- `senha`: obrigatória e no mínimo compatível com a configuração Auth vigente;
- login: e-mail e senha obrigatórios;
- cadastro: impedir submissão enquanto pendente e repetir a proteção no
  servidor;
- mensagens junto aos campos e resumo acessível com `aria-live`;
- nunca apresentar detalhes internos de banco, existência de conta ou tokens;
- login inválido: mensagem genérica “E-mail ou senha inválidos.”;
- falha inesperada: mensagem genérica e registro técnico sem credenciais;
- erros de constraint/provisionamento: Cadastro não concluído, permitir nova
  tentativa após correção.

O mínimo local atual do Supabase é 6 caracteres, mas o formulário não deve
duplicar esse valor sem um contrato/configuração documentada. A política de
senha de produção deve ser confirmada antes do deploy.

## 6. Fluxos definidos

### 6.1 Cadastro e provisionamento

1. Usuário preenche nome, e-mail e senha em `/cadastro`.
2. Cliente aplica validação de experiência; Server Action repete validação e
   normalização.
3. Serviço chama `signUp` com e-mail, senha e `options.data.nome`.
4. Uma nova migration incremental, criada somente na Tarefa 6.3 pela CLI,
   conterá trigger `AFTER INSERT` em `auth.users`.
5. A função do trigger, em schema não exposto, validará `NEW.email` e o nome
   recebido, criará `public.proprietarios` com `NEW.id` e criará a Biblioteca
   inicial usando o `id` retornado.
6. Os dois inserts públicos executam na mesma transação que criou
   `auth.users`. Qualquer constraint ou erro levanta exceção e aborta o
   cadastro inteiro; não há compensação administrativa no frontend.
7. A função será `SECURITY DEFINER` por necessidade comprovada do papel interno
   do Auth, com owner controlado, `search_path = ''`, objetos qualificados e
   execução revogada de `PUBLIC`, `anon` e `authenticated`.
8. O nome em `raw_user_meta_data` é somente entrada de perfil. Ele nunca será
   usado para autorização; a autorização continua em `auth.uid()` e nas FKs.
9. Com confirmação de e-mail desabilitada, `signUp` retorna sessão, os cookies
   são persistidos e o usuário segue para `/dashboard`.
10. Com confirmação habilitada, o cadastro retorna usuário sem sessão. O
    Proprietário e a Biblioteca já existem; a tela informa que a confirmação é
    necessária e não tenta acessar dados privados até o callback/login.

Essa estratégia é preferível a inserts do cliente porque cobre confirmação de
e-mail, elimina falha parcial entre as três entidades e não exige
`service_role`.

O ambiente local atual define `enable_confirmations = false`. A implementação
da Etapa 6 deve funcionar e ser testada nesse modo. Habilitar confirmação no
ambiente hospedado adiciona callback e entrega de e-mail; essa decisão deve ser
sincronizada com SMTP e URLs autorizadas antes do deploy, sem mudar o modelo de
provisionamento.

### 6.2 Login

1. Usuário não autenticado acessa `/login`.
2. Server Action valida e normaliza e-mail e exige senha.
3. Adaptador chama `signInWithPassword`.
4. Em sucesso, o cliente SSR grava os cookies de sessão.
5. Serviço consulta o próprio Proprietário e a Biblioteca.
6. Se ambos existem, redireciona para `next` seguro ou `/dashboard`.
7. Se a conta não possui perfil ou Biblioteca por dado legado/inconsistente,
   não libera uma área parcialmente funcional: encerra a sessão local, mostra
   erro de configuração da conta e registra diagnóstico.
8. Credenciais inválidas, usuário inexistente e método incompatível recebem a
   mesma mensagem genérica.
9. Usuário já autenticado é redirecionado pelo servidor para Dashboard.

Não se deve criar perfil ausente silenciosamente durante todo login. O trigger
é a fonte de provisionamento para contas novas; qualquer recuperação de legado
deve ser explícita, idempotente, testada e autorizada.

### 6.3 Restauração e atualização da sessão

- Cada requisição relevante passa pelo Proxy para leitura e possível renovação
  dos tokens.
- Cookies renovados são copiados para a requisição que segue ao App Router e
  para a resposta ao navegador.
- O layout privado valida a identidade antes de renderizar.
- A identidade real alimenta `AppShell`, Perfil e Configurações, substituindo
  apenas os dados fixos pertencentes à Etapa 6.
- Estados de carregamento usam `loading.tsx` ou estado pendente do formulário;
  não se deve exibir brevemente conteúdo privado com base em mock.
- Sessão inválida ou expirada remove a navegação privada e redireciona para
  Login.

### 6.4 Logout

1. Ação “Sair” é adicionada ao shell privado.
2. Serviço chama `signOut({ scope: 'local' })` para encerrar a sessão corrente,
   salvo decisão explícita futura de sair de todos os dispositivos.
3. O cliente SSR remove/atualiza cookies e o estado local de Auth.
4. A interface executa `replace('/login')` e atualização da árvore renderizada.
5. Outras abas compartilham os cookies; no próximo foco/navegação, Proxy e
   layout rejeitam a sessão. Um listener de mudança de Auth pode antecipar a
   atualização visual, sem ser usado como barreira de segurança.
6. Se a chamada remota falhar, a aplicação não deve alegar revogação global.
   Deve limpar a experiência local quando seguro, redirecionar e informar que
   pode ser necessário tentar novamente.

Tokens de acesso já emitidos podem permanecer válidos até expirar mesmo após a
revogação do refresh token. Para o escopo atual, usa-se expiração curta padrão,
RLS e validação por requisição; controles de sessão mais rígidos só devem ser
adicionados se houver requisito.

## 7. Arquivos previstos para as próximas tarefas

### Criar

| Arquivo provável                   | Responsabilidade                                           |
| ---------------------------------- | ---------------------------------------------------------- |
| `src/data/supabase/browser.ts`     | fábrica SSR do cliente de navegador                        |
| `src/data/supabase/server.ts`      | fábrica por requisição para Server Components/Actions      |
| `src/data/supabase/proxy.ts`       | renovação e cópia de cookies no Proxy                      |
| `src/data/supabase/auth.ts`        | operações Auth e leitura mínima de Proprietário/Biblioteca |
| `src/services/auth.ts`             | casos de uso, validação, normalização e erros              |
| `src/types/auth.ts`                | entradas e resultados compartilhados                       |
| `src/proxy.ts`                     | renovação e redirecionamento antecipado                    |
| `src/app/(auth)/cadastro/page.tsx` | interface de cadastro                                      |
| `src/app/(auth)/actions.ts`        | Server Actions de Cadastro e Login                         |
| `src/app/auth/callback/route.ts`   | somente se confirmação/PKCE exigir callback                |
| nova migration da Tarefa 6.3       | função privada e trigger de provisionamento                |
| testes de autenticação             | validações, serviços, Proxy, integração e fluxo            |

### Modificar

| Arquivo provável                           | Responsabilidade                                                      |
| ------------------------------------------ | --------------------------------------------------------------------- |
| `package.json` / `package-lock.json`       | adicionar `@supabase/ssr` com versão fixa                             |
| `src/app/login/page.tsx`                   | substituir simulação pelo formulário funcional                        |
| `src/app/page.tsx`                         | redirecionamento baseado em identidade                                |
| `src/app/(private)/layout.tsx`             | validação de identidade no servidor                                   |
| `src/components/app-shell.tsx`             | usuário real e ação de Logout                                         |
| `src/app/(private)/perfil/page.tsx`        | nome/e-mail reais, apenas no escopo aprovado                          |
| `src/app/(private)/configuracoes/page.tsx` | resumo real mínimo da conta                                           |
| `supabase/tests/rls_e_acesso_publico.sql`  | adaptar fixtures ao novo trigger sem duplicar Proprietário/Biblioteca |
| `supabase/config.toml`                     | somente se a decisão de confirmação/callback exigir                   |
| documentação técnica e de estado           | consolidar a implementação real                                       |

O atual `src/data/supabase/client.ts` deve ser substituído ou transformado sem
manter duas fábricas concorrentes. A escolha do nome final ocorre na Tarefa 6.2.

### Preservar sem alteração funcional

- as quatro migrations da Etapa 5;
- `docs/SDD-sistema.md`;
- mocks de Livros, Solicitações e Empréstimos;
- RPCs públicas;
- páginas de catálogo e operações posteriores, salvo adaptação estritamente
  necessária à proteção do layout;
- recuperação de senha, autenticação social, exclusão de conta e alteração de
  senha, que não pertencem ao escopo atual definido.

## 8. Riscos e decisões pendentes

| Risco/decisão                                                | Tratamento                                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Trigger defeituoso bloqueia cadastro                         | migration isolada, reset limpo, testes positivos/negativos e inspeção de logs  |
| Fixtures atuais duplicam dados após trigger                  | adaptar apenas o teste SQL na Tarefa 6.3                                       |
| Nome vem de metadata editável                                | usar somente como dado inicial de perfil, nunca para autorização               |
| E-mail em Auth e Proprietário pode divergir após mudança     | mudança de e-mail não será implementada sem fluxo transacional específico      |
| Confirmação local está desabilitada e hospedado pode diferir | testar modo local atual e decidir SMTP/callback antes do deploy                |
| `@supabase/ssr` evolui                                       | fixar versão, conferir changelog e documentação na tarefa de instalação        |
| Proxy virar única defesa                                     | repetir validação no layout/actions e manter RLS                               |
| Cache de resposta autenticada vazar sessão                   | rotas dinâmicas e respostas de Auth sem cache compartilhado                    |
| `next` causar open redirect                                  | aceitar somente caminhos internos permitidos                                   |
| Dados fixos fora da SDD em Perfil                            | integrar somente nome/e-mail; manter demais campos simulados ou desabilitados  |
| Logout em múltiplas abas/dispositivos                        | escopo local documentado; cookies compartilhados e revalidação por requisição  |
| Conta legada incompleta                                      | bloquear área privada e diagnosticar; não criar dados silenciosamente no login |

O changelog atual do Supabase registra uma alteração recente de
`API_EXTERNAL_URL` para instalações self-hosted. O projeto usa o stack da CLI e
as variáveis públicas fornecidas por ele; não foi identificada mudança de
código necessária nesta tarefa. A configuração deve ser reconferida quando a
infraestrutura de Auth for implementada.

## 9. Subtarefas recomendadas

### Tarefa 6.2 — Infraestrutura de autenticação e sessão

- Status: **Concluída em 28 de julho de 2026.**
- Objetivo: instalar `@supabase/ssr`, criar clientes browser/server/proxy,
  persistir/renovar cookies e definir contratos/validações.
- Arquivos: package/lockfile, `src/data/supabase/**`, `src/services/auth.ts`,
  `src/types/auth.ts`, `src/proxy.ts`.
- Dependências: configuração pública existente e documentação oficial atual.
- Riscos: cookies não propagados, validação por `getSession`, cache e matcher
  excessivo.
- Conclusão: clientes isolados e testados, sessão renovada sem UI funcional e
  nenhum segredo exposto.

### Tarefa 6.3 — Cadastro, Proprietário e Biblioteca inicial

- Objetivo: criar formulário, trigger transacional e fluxo completo de
  cadastro.
- Arquivos: rota/ações de Cadastro, serviço/adaptador Auth, nova migration,
  testes SQL e de integração.
- Dependências: Tarefa 6.2 e stack local.
- Riscos: trigger bloquear Auth, metadata ausente, duplicidade e diferenças de
  confirmação de e-mail.
- Conclusão: cadastro cria exatamente um usuário, um Proprietário e uma
  Biblioteca, ou não cria nenhum; retries e erros são testados.

### Tarefa 6.4 — Login

- Objetivo: integrar a tela existente a `signInWithPassword` e validar o
  provisionamento da conta.
- Arquivos: Login, actions, serviço/adaptador e testes.
- Dependências: 6.2 e 6.3.
- Riscos: enumeração de usuários, open redirect e conta inconsistente.
- Conclusão: credenciais válidas criam sessão/cookies e redirecionam; inválidas
  recebem mensagem genérica; conta incompleta é bloqueada.

### Tarefa 6.5 — Restauração de sessão e proteção de rotas

- Objetivo: proteger área privada, desviar usuários autenticados das rotas de
  visitante e carregar identidade real.
- Arquivos: Proxy, raiz, layout privado, shell e pontos mínimos de Perfil/
  Configurações.
- Dependências: 6.2 e 6.4.
- Riscos: conteúdo privado momentâneo, loop de redirect, matcher incorreto e
  confiança exclusiva no Proxy.
- Conclusão: matriz de rotas passa para sessão válida, ausente e expirada; RLS
  continua isolando dois usuários.

### Tarefa 6.6 — Logout

- Objetivo: encerrar sessão corrente, limpar cookies/estado e voltar ao Login.
- Arquivos: shell, action/serviço/adaptador e testes.
- Dependências: 6.5.
- Riscos: alegar logout global, aba com UI antiga e falha remota.
- Conclusão: rota privada deixa de ser acessível após logout, inclusive após
  reload, e o comportamento entre abas está documentado/testado.

### Tarefa 6.7 — Validação, documentação e consolidação

- Objetivo: executar matriz final de Cadastro, Login, restauração, proteção,
  isolamento e Logout e sincronizar documentação.
- Arquivos: testes e documentos afetados; sem nova funcionalidade.
- Dependências: 6.2 a 6.6.
- Riscos: diferença local/remoto e cobertura apenas visual.
- Conclusão: `npm run validate`, reset/lint de banco, testes Auth/RLS e
  `git diff --check` aprovados; Etapa 6 documentada sem antecipar a Etapa 7.

## 10. Referências técnicas consultadas

- Supabase, “Creating a Supabase client for SSR”:
  <https://supabase.com/docs/guides/auth/server-side/creating-a-client>
- Supabase, “Advanced guide — Server-Side Auth”:
  <https://supabase.com/docs/guides/auth/server-side/advanced-guide>
- Supabase, “Which package to use”:
  <https://supabase.com/docs/guides/auth/choosing-a-server-package>
- Supabase, “User Management”:
  <https://supabase.com/docs/guides/auth/managing-user-data>
- Supabase, “Password-based Auth”:
  <https://supabase.com/docs/guides/auth/passwords>
- Supabase, “User sessions”:
  <https://supabase.com/docs/guides/auth/sessions>
- Supabase, `signInWithPassword` e `signOut`:
  <https://supabase.com/docs/reference/javascript/auth-signinwithpassword> e
  <https://supabase.com/docs/reference/javascript/auth-signout>
- Next.js 16, convenção `proxy.ts`:
  <https://nextjs.org/docs/app/api-reference/file-conventions/proxy>
- Next.js 16, API assíncrona `cookies()`:
  <https://nextjs.org/docs/app/api-reference/functions/cookies>
- Supabase, referência de `getClaims()`:
  <https://supabase.com/docs/reference/javascript/auth-getclaims>
- Supabase, prompt oficial atualizado para Next.js 16:
  <https://supabase.com/docs/guides/ai-tools/ai-prompts/nextjs-supabase-auth>

## 11. Validações executadas

| Comando                                        | Resultado real                                                                        |
| ---------------------------------------------- | ------------------------------------------------------------------------------------- |
| `git status --short --branch`                  | início limpo em `main...origin/main`; ao final, somente este documento novo           |
| `git log -1 --oneline`                         | `810757f feat(database): concluir etapa 5 - modelagem do banco e segurança`           |
| `git diff --check`                             | aprovado, código 0 e sem erros                                                        |
| `npm ls --depth=0`                             | dependências declaradas confirmadas; informou também artefatos WASM/Sharp extraneous  |
| `npm run validate`                             | aprovado após formatar este documento                                                 |
| `npm run db:migrations:list`                   | quatro migrations locais e remotas sincronizadas no banco local                       |
| `npm run db:start`                             | stack local disponível/iniciado                                                       |
| `npm run db:reset`                             | primeira execução falhou no bootstrap do contêiner, antes das migrations              |
| `npx supabase db reset --local --debug`        | repetição diagnóstica aprovada; quatro migrations aplicadas e contêineres reiniciados |
| `npx supabase db lint --local --schema public` | aprovado: `No schema errors found`                                                    |

Detalhes de `npm run validate`:

- ESLint: aprovado;
- Prettier: aprovado;
- TypeScript: aprovado;
- Vitest: 1 arquivo e 2 testes aprovados;
- Next.js: build de produção aprovado.

A primeira tentativa de `npm run db:migrations:list` foi bloqueada pelo sandbox
quando a CLI tentou gravar telemetria em `C:\Users\Daiane\.supabase`. O mesmo
comando foi repetido com a permissão apropriada e aprovado. Isso não representa
falha do repositório ou do banco.

## 12. Alterações realizadas

- Criado `docs/plano-tecnico-autenticacao.md` para concentrar o diagnóstico e a
  definição técnica da Tarefa 6.1.
- Nenhum arquivo de código funcional foi alterado.
- Nenhuma migration foi criada, editada, renomeada ou excluída.
- `docs/SDD-sistema.md` permaneceu inalterado.
- Nenhuma dependência foi instalada ou atualizada.
- Nenhum arquivo foi excluído.
- Nenhum commit, push, vínculo remoto ou deploy foi realizado.

## 13. Implementação da Tarefa 6.2

### Dependência e APIs confirmadas

Foi instalada a versão fixa `@supabase/ssr@0.12.3`, marcada como `latest` no
registro npm durante a tarefa. Ela declara peer dependency
`@supabase/supabase-js ^2.110.5`, compatível com a versão `2.110.9` já fixada no
projeto. Nenhuma atualização geral de pacotes foi executada.

A implementação segue as APIs atuais:

- `createBrowserClient` no navegador;
- `createServerClient` com `getAll` e `setAll` no servidor e no Proxy;
- `cookies()` assíncrono do Next.js 16;
- função nomeada `proxy(request: NextRequest)` em `src/proxy.ts`;
- `getClaims()` para validar identidade e provocar renovação segura;
- segundo parâmetro de `setAll` para propagar cabeçalhos anti-cache.

O uso anterior de `createClient` diretamente em
`src/data/supabase/client.ts` foi removido. Não existe armazenamento manual de
tokens, `localStorage` paralelo, `getSession()` como prova de identidade nem
pacote Auth Helpers obsoleto.

### Arquivos e responsabilidades

| Arquivo                        | Responsabilidade                                               |
| ------------------------------ | -------------------------------------------------------------- |
| `src/data/supabase/browser.ts` | singleton preguiçoso por aba com configuração pública          |
| `src/data/supabase/server.ts`  | cliente por requisição e adaptador de cookies do servidor      |
| `src/data/supabase/proxy.ts`   | renovação, cookies de request/response e cabeçalhos anti-cache |
| `src/data/supabase/auth.ts`    | identidade mínima obtida de claims verificadas                 |
| `src/proxy.ts`                 | integração do utilitário ao Proxy do Next.js e matcher         |
| `src/services/auth.ts`         | normalizações, validações e categorias internas de erro        |
| `src/types/auth.ts`            | contratos mínimos de identidade, validação e erro              |
| `vitest.config.ts`             | resolução do alias `@/` na suíte                               |

Os READMEs de `src/services` e `src/types` foram sincronizados com as
responsabilidades agora implementadas nessas camadas.

O cliente de servidor ignora somente a mensagem específica emitida pelo Next.js
quando um Server Component tenta escrever cookies. Qualquer outro erro é
relançado. O Proxy copia cookies renovados para a requisição que segue ao App
Router e para a resposta enviada ao navegador. Também preserva múltiplos lotes
de atualização e aplica `Cache-Control`, `Expires` e `Pragma` quando fornecidos
pelo pacote.

O matcher exclui recursos internos, metadados, imagens, fontes, mapas e outros
arquivos estáticos, além da rota técnica `reference-image`. Ele não contém
nenhuma matriz de redirecionamento. A ausência de sessão produz resposta normal,
sem redirecionar.

### Limites e segurança preservados

Somente `NEXT_PUBLIC_SUPABASE_URL` e
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` são usadas pelos clientes. Não foram
adicionados segredo, `service_role`, logs de sessão, acesso/refresh token ou
metadata de autorização.

As quatro migrations, RLS, policies, grants, RPCs e `supabase/config.toml`
permaneceram inalterados. Cadastro, trigger de provisionamento, Login funcional,
proteção final, Logout e recursos das etapas seguintes não foram implementados.

### Testes da infraestrutura

Foram criados testes unitários para:

- normalização e validação de e-mail e nome;
- campos obrigatórios e erros sem detalhes sensíveis;
- singleton e configuração pública do cliente de navegador;
- cliente de servidor por requisição, leitura e escrita de cookies;
- limitação de escrita em Server Components e propagação de erros inesperados;
- renovação e propagação de cookies/cabeçalhos no Proxy;
- comportamento sem sessão e ausência de redirecionamento;
- matcher de rotas e recursos estáticos;
- mapeamento de claims verificadas para identidade mínima.

A normalização de erros retorna somente categorias internas. Mensagens finais de
interface permanecem reservadas às tarefas que implementarem Cadastro e Login.

A suíte não depende de conexão remota com Supabase. Cadastro, Login, Logout,
proteção final e integração com o banco não são cobertos porque ainda não
existem.

Na validação final da tarefa, `npm run validate` aprovou ESLint, Prettier,
TypeScript, 31 testes em 7 arquivos e o build de produção do Next.js.
`git diff --check` e `npm ls @supabase/ssr @supabase/supabase-js` também foram
aprovados.
