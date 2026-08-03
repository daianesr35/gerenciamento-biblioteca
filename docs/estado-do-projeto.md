# Estado do Projeto

## Situação atual

O projeto concluiu as duas etapas exclusivamente documentais iniciais e a
arquitetura base executável:

- **Etapa 1 — Inspeção do repositório:** concluída.
- **Etapa 2 — Criação do plano técnico:** concluída.
- **Etapa 3 — Definição e implementação da arquitetura base:** concluída.
- **Etapa 4 — Design do Sistema:** concluída em 28 de julho de 2026.
- **Etapa 5 — Modelagem do banco de dados:** concluída; as Tarefas 5.1 a 5.5
  foram concluídas.
- **Etapa 6 — Autenticação:** em andamento; as Tarefas 6.1, 6.2, 6.3, 6.4 e
  6.5 foram concluídas.
- **Etapa 7 — Cadastro manual de livros:** em andamento; as Tarefas 7.1, 7.2,
  7.3 e 7.4 foram concluídas.
- **Etapa 8 — Integração com Google Books:** concluída em 29 de julho de 2026.
- **Etapa 9 — Página Pública e QR Code:** concluída em 29 de julho de 2026; as
  Tarefas 9.1, 9.2, 9.3 e 9.4 foram concluídas.

A Tarefa 6.2 instalou `@supabase/ssr@0.12.3` e implementou a infraestrutura de
sessão SSR: cliente de navegador, cliente de servidor por requisição, utilitário
do Proxy, propagação de cookies, cabeçalhos anti-cache, validação central por
`getClaims()`, contratos mínimos e validações puras. O cliente antigo de
`supabase-js` foi substituído para não manter estratégias concorrentes.

O Cadastro funcional está disponível em `/cadastro`. A Server Action valida e
normaliza Nome, E-mail e Senha, usa o cliente SSR existente para `signUp` e
trata erros seguros. Quando o provedor cria uma sessão imediata, ela é encerrada
somente no escopo local para garantir o fluxo único Cadastro → Login. Uma
migration incremental cria, pelo trigger de `auth.users`, exatamente um
Proprietário e uma Biblioteca na mesma transação.

O Login funcional está disponível em `/login`. A Server Action valida E-mail e
Senha, normaliza o e-mail e usa o mesmo cliente SSR para
`signInWithPassword`. Credenciais válidas criam a sessão por cookies e
redirecionam para `/dashboard`; falhas recebem mensagens seguras.

O Proxy restaura a sessão com a infraestrutura SSR existente e protege somente
as rotas privadas atuais. Sem identidade válida, essas rotas seguem para
`/login`; usuários autenticados em `/login` ou `/cadastro` seguem para
`/dashboard`. O layout privado repete a validação antes de renderizar o
`AppShell`. Logout permanece pendente. Nenhuma configuração remota foi alterada.

O repositório possui uma aplicação Next.js tipada e preparada para evolução
modular. A implementação consolidada da Etapa 4 inclui as dez telas principais,
a tela auxiliar de Edição de Livro, a navegação-base e componentes visuais
reutilizáveis. As interfaces ainda não conectadas utilizam dados simulados e
comportamentos locais para representar integrações e funcionalidades reservadas
às etapas posteriores.

As tabelas `proprietarios`, `bibliotecas`, `livros`, `solicitacoes` e
`emprestimos` e suas migrations SQL de domínio foram criadas. O catálogo
persistente possui dados bibliográficos, situação controlada e vínculo
obrigatório com Biblioteca. Solicitações e Empréstimos possuem estados, datas,
relacionamentos com Livro e vínculo opcional entre si. RLS está habilitada nas
cinco tabelas, o vínculo único com `auth.users` sustenta o isolamento privado e
o acesso anônimo está restrito a três RPCs mínimas, sem acesso direto às
tabelas. Cadastro e Login estão conectados ao Auth, e `/biblioteca` lista os
Livros reais do Proprietário autenticado; as demais telas de domínio continuam
simuladas. A integração com a Google Books está funcional no cadastro de Livro;
QR Code funcional foi implementado; os demais recursos remotos ainda não foram
criados. Login,
Dashboard,
Biblioteca, Cadastro de Livro, Detalhes do Livro, Solicitações, Empréstimos,
Configurações, Perfil e Página Pública passaram pela revisão visual específica e
pela consolidação final de consistência, navegação, responsividade e
acessibilidade da Etapa 4.

## Documentação existente

- `AGENTS.md`: instruções permanentes do projeto.
- `docs/SDD-sistema.md`: especificação funcional oficial e inalterada.
- `docs/plano-de-implementacao.md`: roteiro técnico incremental detalhado.
- `docs/arquitetura.md`: documentação da arquitetura definida e implementada na
  Etapa 3.
- `docs/banco-de-dados.md`: infraestrutura, estratégia de migrations, modelo,
  vínculo com `auth.users`, RLS e acesso público mínimo concluídos até a Tarefa
  5.5.
- `docs/estado-do-projeto.md`: registro do estado atual.

## Resumo da Etapa 1

A inspeção identificou que:

- o repositório contém a documentação inicial do sistema;
- `docs/SDD-sistema.md` é a fonte oficial dos requisitos;
- `docs/arquitetura.md` e `docs/banco-de-dados.md` ainda são estruturas vazias;
- não há aplicação nem funcionalidades implementadas;
- decisões arquiteturais, modelagem de dados e implementação continuam
  pendentes.

## Resumo da Etapa 2

O plano técnico:

- identificou os módulos principais do sistema;
- organizou 13 etapas incrementais, da inspeção ao deploy;
- detalhou objetivo, escopo, tarefas, dependências e itens fora do escopo para
  cada etapa;
- definiu documentos de entrada e saída, verificações, critérios de aceitação e
  conclusão;
- explicitou riscos de segurança, integridade, serviços externos e desvio de
  escopo;
- preservou o princípio de executar somente uma etapa por vez;
- manteve decisões definitivas de arquitetura e banco para suas etapas próprias.

## Interface implementada na Etapa 4

Foi criada a implementação inicial das dez telas principais:

- Login;
- Dashboard;
- Biblioteca;
- Cadastro de Livro;
- Detalhes do Livro;
- Solicitações;
- Empréstimos;
- Configurações;
- Perfil;
- Página Pública.

A implementação também inclui:

- layout compartilhado da área privada;
- sidebar e barra superior;
- navegação entre as rotas principais;
- componentes reutilizáveis de botões, formulários, cards, badges, pesquisa,
  paginação, estatísticas, livros e placeholders;
- comportamento responsivo inicial;
- estados básicos de validação, lista vazia, campo desabilitado, somente leitura
  e feedback local;
- separação dos dados simulados em `src/data/mock`.

A tela Biblioteca foi revisada em relação ao mockup aprovado, incluindo banner,
pesquisa, filtros, indicadores, cards de livros, paginação, responsividade e
acessibilidade visual. Como os dados simulados não possuem imagens de capa, os
cards preservam o placeholder definido no Design System.

A tela Cadastro de Livro foi revisada em relação ao mockup aprovado, incluindo
breadcrumb, agrupamento do formulário, labels, placeholders, controle de
preenchimento manual, mensagens informativas, prévia do livro, ações,
responsividade e acessibilidade específica da tela.

A tela Detalhes do Livro foi revisada em relação ao mockup aprovado, incluindo
organização do resumo bibliográfico, placeholder de capa, status, exemplares,
atividades recentes, ações, espaçamentos, responsividade e acessibilidade
específica da tela.

A tela Solicitações foi revisada em relação ao mockup aprovado, incluindo abas
de contexto, pesquisa, filtros, ordenação, indicadores, listagem, badges de
status, ações simuladas, resumo lateral, paginação, responsividade e
acessibilidade específica da tela.

A tela Empréstimos foi revisada em relação ao mockup aprovado, incluindo abas
de ativos e histórico, pesquisa, filtros, ordenação, indicadores, listagem,
badges de status, ações simuladas, resumo lateral, paginação, responsividade e
acessibilidade específica da tela.

A tela Configurações foi revisada em relação ao mockup aprovado, incluindo
organização das preferências da biblioteca e de empréstimos, personalização,
manutenção, informações do sistema, conta, exportação de dados, controles
simulados, responsividade e acessibilidade específica da tela.

A tela Perfil foi revisada em relação ao mockup aprovado, incluindo organização
das informações pessoais, avatar simulado, preferências, alteração de senha,
resumo e atividade da conta, ação de exclusão, controles simulados,
responsividade e acessibilidade específica da tela.

A tela Página Pública foi revisada em relação ao mockup aprovado, incluindo
organização geral, navegação visual entre seções, banner da biblioteca,
indicadores, livros em destaque, compartilhamento, QR Code representativo,
configurações simuladas, orientação ao visitante, responsividade e acessibilidade
específica da tela.

A tela auxiliar Edição de Livro reutiliza a estrutura visual do Cadastro de
Livro, apresenta os dados simulados preenchidos e pode ser acessada pela ação
“Editar” da tela Detalhes do Livro. O salvamento permanece apenas representado
visualmente.

Os dados e comportamentos da interface não representam persistência ou
funcionalidades definitivas. Login, consulta ISBN, solicitações, empréstimos,
configurações, perfil, compartilhamento e QR Code permanecem simulados ou apenas
representados visualmente.

As telas auxiliares de recuperação e redefinição de senha, erros personalizados,
sucesso, estados vazios específicos e o conjunto completo de modais foram
adiadas e permanecem pendentes.

## Resumo da Etapa 3

- Next.js 16, React 19 e TypeScript foram adotados para a aplicação web;
- Supabase foi confirmado como backend futuro e Vercel como hospedagem futura;
- a estrutura separa rotas, componentes, configuração, acesso a dados, serviços
  e tipos compartilhados;
- ESLint, Prettier, typecheck, Vitest e build foram configurados;
- variáveis públicas possuem exemplo seguro e validação centralizada;
- o cliente público do Supabase é criado somente sob demanda;
- nenhuma credencial real, integração remota ou funcionalidade posterior foi
  incluída.

## Pendências

- Manter as telas auxiliares adiadas para etapa posterior.
- Iniciar a Tarefa 6.6 — Logout somente mediante autorização específica.
- Implementar e validar as funcionalidades definitivas previstas na SDD durante
  suas respectivas etapas.
- Preparar testes integrados e deploy nas respectivas etapas.

As validações automatizadas da consolidação final — lint, typecheck, testes,
build e `git diff --check` — foram aprovadas. A Etapa 4 está formalmente
concluída.

A infraestrutura local da Tarefa 5.1 permanece disponível. A Tarefa 5.2 criou a
primeira migration de domínio, com as tabelas `proprietarios` e `bibliotecas`,
chaves UUID, e-mail único, identificador público único e relacionamento 1:1.
A Tarefa 5.3 criou uma nova migration com a tabela `livros`, seus atributos
bibliográficos, situação `disponivel` ou `emprestado`, vínculo obrigatório com
Biblioteca e índice do catálogo por Biblioteca. A Tarefa 5.4 criou uma terceira
migration de domínio com `solicitacoes` e `emprestimos`, relacionamentos
obrigatórios com Livro, vínculo opcional e único entre Solicitação e Empréstimo,
status de Solicitação, datas e restrições estruturais. Não foram criados Perfil,
autenticação funcional, seeds, triggers, procedures, regras transacionais ou
integração da interface. A Tarefa 5.5 adicionou `usuario_auth_id` a Proprietário,
habilitou RLS nas cinco tabelas, criou policies privadas por operação e limitou
o acesso público a três funções com grants mínimos. As telas continuam baseadas
em mocks.

As validações da Tarefa 5.5 reconstruíram o banco do zero, aplicaram as quatro
migrations, executaram testes positivos e negativos com dois Proprietários e os
papéis `authenticated` e `anon`, e terminaram os dados de teste com `rollback`.
O lint do schema e os advisors locais de segurança e desempenho não encontraram
problemas.

## Conclusão da Tarefa 6.3

A rota `/cadastro`, a Server Action, o adaptador `signUp` e o provisionamento
atômico foram implementados. A migration
`20260729020113_provisionar_proprietario_e_biblioteca.sql` cria uma função
privada endurecida e um trigger `AFTER INSERT` em `auth.users`. O resultado
obrigatório é um usuário Auth, um Proprietário e uma Biblioteca, ou nenhum
registro em caso de falha.

Após o ajuste do requisito de navegação, todo cadastro concluído encaminha para
`/login`. Se o Supabase criar uma sessão imediata, o adaptador a encerra com
`signOut({ scope: 'local' })`; se não criar, nenhuma chamada de encerramento é
feita. Os testes TypeScript e SQL cobrem validações, metadata, resultados de
sessão, erros normalizados, vínculos, quantidades, rollback, dois usuários,
privilégios e isolamento RLS.

Não foram implementados Login, proteção final, Logout ou recursos de tarefas
posteriores. Não houve conexão ou alteração de banco remoto.

## Conclusão da Tarefa 6.4

A rota `/login` passou a usar a Server Action `loginAction`, que repete a
validação no servidor e delega ao serviço e ao adaptador existentes. O adaptador
usa o cliente SSR por requisição para chamar `signInWithPassword`, sem criar
outro cliente ou manipular cookies manualmente.

O fluxo exige e-mail válido e senha presente. O e-mail é normalizado antes da
autenticação. Credenciais válidas criam a sessão e encaminham a interface para
`/dashboard`; credenciais inválidas e falhas inesperadas são convertidas em
categorias internas e mensagens genéricas. O botão permanece desabilitado
durante a submissão.

Os testes indispensáveis cobrem Login válido, senha inválida, e-mail inválido,
erro normalizado, validação da Server Action e chamada correta de
`signInWithPassword`. O Login não consulta, cria ou repara Proprietário ou
Biblioteca: contas criadas pela Tarefa 6.3 já são provisionadas atomicamente.

Não foram implementados proteção de rotas, restauração completa da sessão,
identidade real no AppShell, Logout ou qualquer recurso posterior. Não houve
conexão ou alteração de banco remoto.

## Conclusão da Tarefa 6.5

O Proxy passou a usar o resultado de `getClaims()` para restaurar a sessão e
decidir os redirecionamentos das rotas atualmente existentes. As rotas privadas
aceitam usuários autenticados e redirecionam usuários sem identidade válida
para `/login`. Usuários autenticados que acessam `/login` ou `/cadastro` são
redirecionados para `/dashboard`. A raiz encaminha para Login ou Dashboard
conforme a autenticação.

O layout do grupo privado também valida a identidade pelo adaptador SSR
existente antes de renderizar o `AppShell`, preservando uma segunda barreira
server-side. Cookies, renovação e cabeçalhos anti-cache continuam sob
responsabilidade da infraestrutura criada na Tarefa 6.2. Não foi criado outro
cliente Supabase nem houve manipulação manual de cookies.

Os testes indispensáveis cobrem acesso autenticado a rota privada, desvio de
usuário não autenticado, e acesso autenticado a Login e Cadastro. Não foram
implementados parâmetro `next`, Logout, identidade no AppShell, permissões,
papéis ou recursos posteriores.

## Conclusão da Tarefa 6.6

O Logout funcional foi implementado com o adaptador Supabase existente. A
operação usa `signOut({ scope: 'local' })`, encerrando somente a sessão atual
por meio da infraestrutura SSR e dos cookies já existentes. A Server Action
redireciona o usuário para `/login` após o sucesso.

A opção “Sair” fica no rodapé da barra lateral do `AppShell`, abaixo da
identificação do proprietário. Em caso de falha, a interface permanece na área
autenticada e apresenta somente “Não foi possível sair. Tente novamente.”, sem
expor mensagens internas do provedor.

Os testes indispensáveis cobrem a chamada de `signOut`, o escopo local, o
Logout concluído, o redirecionamento para `/login` e a mensagem segura em caso
de falha. As proteções de rotas da Tarefa 6.5 e os fluxos existentes de Cadastro
e Login foram preservados.

Nenhum cliente Supabase, migration, manipulação manual de cookies ou
funcionalidade posterior foi adicionado.

## Conclusão da Tarefa 7.1

A Tarefa 7.1 — Inspeção e planejamento técnico do catálogo foi concluída. O
repositório, o modelo persistente de Livro, as policies RLS, a infraestrutura
Supabase SSR e as interfaces simuladas do catálogo foram inspecionados. O plano
técnico detalhado da Etapa 7 foi criado em `docs/plano-tecnico-catalogo.md`.

Nenhuma funcionalidade do CRUD de Livros foi implementada, nenhuma página foi
conectada ao banco e nenhuma migration ou policy foi alterada. A Etapa 7
permanece em andamento.

A próxima tarefa autorizada será a Tarefa 7.2 — Camada mínima de consulta do
catálogo, primeira tarefa funcional definida no plano técnico, somente mediante
autorização específica.

## Conclusão da Tarefa 7.2

A camada mínima de consulta do catálogo foi implementada. Existem operações
para listar os Livros da Biblioteca do Proprietário autenticado e consultar um
Livro próprio por identificador. As consultas usam o cliente Supabase de
servidor por requisição, resolvem a Biblioteca visível à sessão SSR, aplicam
filtro explícito por Biblioteca e permanecem protegidas pela RLS.

O contrato interno de leitura preserva somente os sete campos necessários, e as
falhas técnicas são convertidas em resultados seguros. Livro inexistente e
Livro inacessível possuem o mesmo resultado de não encontrado.

Nenhuma página foi conectada, nenhum mock foi alterado e nenhuma mutação,
migration ou policy foi implementada. A Etapa 7 continua em andamento. A
próxima tarefa recomendada é a Tarefa 7.3 — Listagem real.

## Conclusão da Tarefa 7.3

A página privada `/biblioteca` foi convertida em Server Component e conectada
exclusivamente a `listOwnBooks()`. A listagem preserva a ordenação do service e
apresenta os dados reais em cards, com título, autor, capa ou placeholder,
situação traduzida para `Disponível` ou `Emprestado` e links de detalhe e
edição.

Lista vazia é tratada como sucesso com acesso a `/livros/novo`. Falhas recebem
mensagem segura sem detalhes internos. Busca, filtros, ordenação configurável,
estatísticas, paginação e ações simuladas incompatíveis foram removidos da
composição da página.

O `BookCard` permanece compatível com os mocks usados pelo Dashboard. O arquivo
de mocks foi preservado, e as demais páginas continuam simuladas. Nenhuma
mutação, migration, policy ou cliente Supabase de navegador foi criado. A Etapa
7 continua em andamento, e a próxima tarefa é a Tarefa 7.4 — Cadastro manual.

## Conclusão da Tarefa 7.4

A rota privada `/livros/novo` foi conectada ao cadastro manual real por Server
Action. O formulário aceita somente título e autor obrigatórios, além de ISBN,
editora e URL da capa opcionais. Os valores são normalizados e validados no
servidor; campos opcionais vazios são persistidos como `null`.

O service coordena a criação e converte falhas técnicas em resultado seguro. O
adaptador reutiliza um único cliente Supabase SSR, resolve a Biblioteca
autenticada no servidor e insere somente os campos bibliográficos permitidos e
o `biblioteca_id` resolvido. O navegador não fornece `biblioteca_id` nem
`situacao`; o banco mantém o default `disponivel` e a RLS permanece como
barreira final.

Após a inserção confirmada, a Server Action revalida `/biblioteca` e redireciona
para essa listagem real, onde o Livro recém-cadastrado passa a aparecer. Busca
por ISBN, Google Books, código de barras, prévia e campos não persistidos foram
removidos da composição de cadastro.

A rota de edição foi separada da criação e permanece sem carregamento ou
salvamento real. Nenhuma edição, exclusão, detalhe real, migration ou policy foi
implementada. A Etapa 7 continua em andamento, e a próxima tarefa é a Tarefa
7.5 — Detalhes.

## Conclusão da Tarefa 7.5

A rota privada `/livros/[id]` foi mantida como Server Component e conectada
exclusivamente a `getOwnBookById()`, com uma chamada por renderização usando o
UUID recebido pela rota. O service e o adaptador Supabase SSR existentes foram
reutilizados, preservando o filtro pela Biblioteca autenticada e a RLS.

A página apresenta somente os dados reais do contrato `Book`: título, autor,
ISBN, editora, capa e situação traduzida para `Disponível` ou `Emprestado`.
ISBN e editora ausentes recebem a indicação `Não informado`; a capa ausente usa
o placeholder do Design System.

UUID inválido e Livro não encontrado ou inacessível recebem a mesma mensagem
segura. Falhas técnicas recebem mensagem genérica, sem detalhes internos. Todos
os estados oferecem retorno para `/biblioteca`.

Dados bibliográficos fictícios, descrição, categorias, etiquetas, notas,
exemplares, atividades e datas simuladas foram removidos da composição. Ações
simuladas de exclusão, empréstimo, devolução, solicitação e alteração de
metadados também foram removidas. O link visual para a rota de edição foi
preservado, mas a edição continua explicitamente indisponível nessa rota.

Nenhuma consulta foi duplicada, e nenhum cliente Supabase de navegador, Server
Action, API Route, migration ou policy foi criado ou alterado. A exclusão
também permanece não implementada. A Etapa 7 continua em andamento, e a
próxima tarefa é a Tarefa 7.6 — Edição.

## Conclusão da Tarefa 7.6

A rota privada `/livros/[id]/editar` foi conectada aos dados reais. O
carregamento inicial ocorre no servidor com uma única chamada a
`getOwnBookById()`, e o formulário apresenta os valores atuais de título,
autor, ISBN, editora e URL da capa.

A Server Action específica de edição envia somente os cinco campos permitidos
ao service. Título e autor são obrigatórios, os valores são normalizados no
servidor, opcionais vazios são convertidos em `null` e a URL da capa aceita
somente HTTP ou HTTPS.

O adaptador usa o cliente Supabase SSR por requisição, resolve a Biblioteca da
sessão autenticada e executa `UPDATE` filtrado explicitamente pelo UUID do Livro
e pelo `biblioteca_id`, sob as policies RLS existentes. O payload não permite
alterar identificadores, situação ou datas. Livro inexistente ou inacessível e
falhas técnicas recebem estados públicos seguros.

Após o sucesso, `/biblioteca`, `/livros/[id]` e `/livros/[id]/editar` são
revalidados, e o usuário é redirecionado para os detalhes atualizados. Foram
adicionados testes proporcionais da página, Server Action, service e adaptador,
sem acesso à rede ou ao Supabase remoto.

O teste manual autenticado não foi executado.

Exclusão ainda não foi implementada. A Etapa 7 permanece em andamento, e a
próxima tarefa é a Tarefa 7.7 — Exclusão.

## Conclusão da Tarefa 7.7

A exclusão física segura de Livro foi implementada na rota privada de detalhes.
O controle exige confirmação explícita, informa que a ação é permanente,
permite cancelar e desabilita a confirmação durante o envio.

A Server Action específica recebe somente o UUID e chama o service de exclusão.
O service valida o identificador antes de acessar o adaptador e distingue
sucesso, ausência segura, relacionamento impeditivo e falha técnica.

O adaptador usa o cliente Supabase SSR por requisição, resolve a Biblioteca da
sessão autenticada no servidor e executa `DELETE` filtrado explicitamente por
`biblioteca_id` e UUID, sob a RLS e a policy `livros_delete_proprios`
existentes. Zero linhas é tratado como Livro inexistente ou inacessível. A
violação de foreign key é identificada pelo código PostgreSQL `23503` somente
na camada interna e apresentada ao usuário por mensagem segura.

Solicitações e Empréstimos relacionados não são removidos. As foreign keys com
`ON DELETE RESTRICT` permanecem preservadas, sem cascata, soft delete, mudança
de situação, migration ou alteração de policy.

Após uma exclusão confirmada, `/biblioteca` e `/livros/[id]` são revalidados e
o usuário é redirecionado para `/biblioteca`. Falhas não revalidam nem
redirecionam e não expõem mensagens do Supabase ou detalhes do banco.

Foram executadas as seguintes verificações:

- testes específicos: 4 arquivos e 19 testes aprovados;
- ESLint: aprovado;
- Prettier: aprovado;
- TypeScript: aprovado;
- suíte completa: 20 arquivos e 122 testes aprovados;
- build Next.js: aprovado;
- rota `/livros/[id]`: dinâmica e renderizada no servidor.

Teste manual autenticado: executado com sucesso. Foram validados o fluxo de
confirmação e cancelamento, a exclusão real e o redirecionamento para
`/biblioteca`.

A Etapa 7 permanece em andamento. A próxima tarefa é a Tarefa 7.8 —
Encerramento e validação do CRUD.

## Conclusão da Tarefa 8.2

A infraestrutura server-side de consulta por ISBN na Google Books foi
implementada sem integração com o formulário. A configuração privada,
contratos, adaptador HTTP com `fetch` nativo e timeout, service de normalização
e mapeamento, Server Action exclusiva e testes unitários estão disponíveis.

O MVP remove espaços e hífens do ISBN e valida somente o comprimento de 10 ou
13 caracteres, sem checksum. A consulta solicita um único resultado e usa o
primeiro volume retornado. Somente título, autores, ISBN, editora e URL da capa
são mapeados; dados ausentes permanecem vazios.

ISBN inválido, livro não encontrado, erro HTTP, rede, timeout e resposta
inesperada produzem resultados padronizados. A consulta não acessa Supabase,
não cria ou altera registros, não chama `createOwnBook`, não revalida páginas e
não redireciona.

A integração visual e o preenchimento editável do formulário permanecem
exclusivamente para a Tarefa 8.3.

## Conclusão da Tarefa 8.3

O formulário de novo Livro passou a consultar a Server Action da Google Books
por um botão `Buscar ISBN` independente da submissão. Durante a consulta, o
botão fica desabilitado e apresenta um estado simples de carregamento.

Quando a consulta encontra o Livro, somente título, autor, ISBN, editora e URL
da capa que possuam valor são preenchidos. Todos os campos permanecem editáveis,
e valores vazios da API não apagam informações digitadas. ISBN inválido, Livro
não encontrado, timeout e indisponibilidade exibem mensagens simples e
preservam integralmente o formulário.

O cadastro manual continua disponível sem consulta e sem ISBN. A persistência
permanece exclusivamente no botão `Salvar livro`, por meio de
`createBookAction` e `createOwnBook`. A consulta não acessa Supabase, não salva,
não revalida páginas e não redireciona. Banco, migrations, RLS, autenticação,
sessão, dependências e a SDD oficial não foram alterados.

## Conclusão da Tarefa 8.4 e da Etapa 8

A revisão final confirmou a integração Google Books operacional e coerente com
a arquitetura. ISBN válido consulta o serviço server-side e preenche somente os
dados bibliográficos disponíveis; todos os campos permanecem editáveis. ISBN
inválido, ausência no catálogo, timeout e indisponibilidade apresentam mensagens
padronizadas sem apagar valores já digitados.

O cadastro manual permanece funcional sem ISBN e sem consulta. `Buscar ISBN` é
um botão independente e não persiste, revalida nem redireciona; somente `Salvar
livro` executa `createBookAction`, `createOwnBook` e a inserção no Supabase.

A cobertura existente foi considerada suficiente e proporcional ao
encerramento: adaptador HTTP, timeout e indisponibilidade, normalização e
mapeamento, Server Action sem efeitos colaterais, preenchimento parcial,
preservação do formulário e composição da página estão automatizados. A suíte
completa possui 24 arquivos e 150 testes aprovados. `git diff --check`, ESLint,
Prettier, TypeScript e o build de produção também foram aprovados.

Não foram alterados banco de dados, migrations, RLS, autenticação, sessão,
Supabase, dependências, arquitetura principal ou a SDD oficial. Nenhuma
funcionalidade de etapa futura foi antecipada. A Etapa 8 está concluída e o
projeto está pronto para usar esse resultado como base da Etapa 9.

## Conclusão da Tarefa 9.4 e da Etapa 9

As Tarefas 9.1, 9.2, 9.3 e 9.4 foram concluídas. A Etapa 9 entrega a rota
pública `/biblioteca/[identificador]`, acesso anônimo exclusivamente pelas RPCs
públicas existentes, catálogo restrito a Livros disponíveis, pesquisa local por
título e autor, capa ou placeholder e estados seguros de carregamento,
Biblioteca inexistente, catálogo vazio, pesquisa sem resultados e
indisponibilidade temporária.

A rota privada `/pagina-publica` permanece protegida pela autenticação e pela
RLS. Ela consulta somente `identificador_publico` com o cliente Supabase SSR,
constrói a URL com `NEXT_PUBLIC_APP_URL`, exibe a mesma URL no campo e no QR
Code e permite copiar o link ou abrir a Página Pública em nova aba com
`noopener,noreferrer`. O QR Code SVG gerado por `qrcode.react@4.2.0` possui
regra visual específica para neutralizar `stroke`.

A validação final aprovou `git diff --check`, ESLint, Prettier, TypeScript, 31
arquivos com 172 testes automatizados e o build de produção. Não foram
encontrados defeitos que exigissem correção de código. Banco, tabelas,
migrations, RLS, grants, RPCs, autenticação e integração Google Books
permaneceram inalterados, e nenhuma credencial foi adicionada.

Como limitações deliberadas do MVP, não foram implementados solicitações de
empréstimo, formulário público, empréstimos, devoluções, notificações, download
ou QR Code por Livro, compartilhamento social, personalização, categorias ou
paginação. A leitura física do QR Code em celular deverá ser confirmada após o
deploy, quando `NEXT_PUBLIC_APP_URL` estiver acessível pelo aparelho.

A Etapa 9 está formalmente concluída. A próxima etapa do plano é a **Etapa 10 —
Solicitações de empréstimo**, que não foi iniciada.

## Conclusão da Tarefa 10.2

A Página Pública permite selecionar um Livro disponível, informar nome e
telefone e enviar uma solicitação de empréstimo. O fluxo utiliza Server Action,
Service, adaptador e o cliente Supabase público existentes, e persiste a
solicitação exclusivamente pela RPC `criar_solicitacao_publica`.

O formulário apresenta estados de envio, sucesso e erro, impede novo envio
enquanto a requisição está em andamento e não exibe detalhes internos do banco.
Nome e telefone são validados no Service, enquanto pertencimento à Biblioteca,
existência e disponibilidade do Livro, data e status inicial `pendente`
continuam sob autoridade da RPC.

Foram adicionados testes do Service, adaptador, Server Action e integração
inicial do formulário com o catálogo público. Como pequeno ajuste complementar
solicitado durante os testes manuais, o banner da Página Pública passou a
exibir o nome do Proprietário. O contrato da Biblioteca pública foi atualizado
para incluir esse nome, consultado exclusivamente pela nova RPC pública
`obter_nome_proprietario_publico`, criada por migration versionada com concessão
mínima de `EXECUTE` ao papel `anon`.

O papel `anon` continua sem acesso direto às tabelas e não recebeu grant de
leitura. A exposição permanece limitada ao nome retornado pela RPC controlada;
nenhuma policy RLS foi alterada ou enfraquecida. A SDD oficial do sistema, o QR
Code e o fluxo de compartilhamento permaneceram inalterados.

A Etapa 10 permanece em andamento. Listagem privada, confirmação e recusa de
solicitações pertencem às tarefas posteriores da própria Etapa 10 e não foram
antecipadas. Empréstimos e devoluções da Etapa 11 também não foram
implementados.

# Atualização — Tarefa 10.3

A rota privada `/solicitacoes` lista solicitações reais visíveis pela RLS ao
proprietário autenticado, com livro, solicitante, telefone, data, estado vazio,
falha segura e os estados oficiais Pendente, Confirmada e Recusada.

Server Actions, Service, adaptador Supabase de servidor e RPCs privadas
implementam confirmação e recusa. A confirmação altera atomicamente a
solicitação para `confirmada` e o livro disponível para `emprestado`; a recusa
altera somente a solicitação. Nenhum registro em `emprestimos` é criado.

A Tarefa 10.3 está concluída. A Etapa 10 permanece em andamento, com a Tarefa
10.4 pendente.

# Atualização — Tarefa 10.4

Os fluxos público e privado implementados nas Tarefas 10.2 e 10.3 atendem ao
escopo e aos critérios de conclusão da Etapa 10: criação pública restrita a
livros disponíveis, status inicial `pendente`, isolamento por biblioteca,
listagem privada, confirmação e recusa, além da confirmação atômica com
proteção contra processamento concorrente ou repetido.

Não foi identificada pendência funcional adicional para o encerramento. Nenhum
ajuste de código ou banco de dados foi necessário, e nenhuma funcionalidade de
empréstimos, devoluções, histórico, notificações, lembretes ou reservas foi
antecipada.

A Tarefa 10.4 e a Etapa 10 estão concluídas.

# Atualização — Tarefa 11.4 e Etapa 11

A Etapa 11 — Empréstimos e Devoluções está concluída. A confirmação de uma
solicitação cria exatamente um empréstimo e sincroniza `solicitacoes`,
`emprestimos` e `livros`; o backfill conservador trata solicitações confirmadas
anteriores; o empréstimo direto e a devolução são atômicos, autenticados e
isolados por proprietário.

A rota `/emprestimos` utiliza dados reais, preserva o design aprovado e a
responsividade e atualiza listagem, abas e indicadores após as operações. A
validação final aprovou `git diff --check`, ESLint, Prettier, TypeScript, 41
arquivos com 200 testes automatizados, build de produção, recriação integral do
banco, ordem das migrations, scripts SQL transacionais, lint do banco e
advisors locais de segurança e desempenho.

Não foram encontrados defeitos impeditivos nem regressões, e nenhuma
funcionalidade nova foi adicionada. A próxima etapa é a **Etapa 12 — Testes**.

# Atualização — Etapa 12

A Etapa 12 — Consolidação e Validação Final (Expressa) está concluída. A matriz
objetiva em `docs/matriz-rastreabilidade-etapa12.md` relaciona todos os critérios
de funcionamento da SDD oficial às evidências automatizadas e SQL existentes.
Não foi identificada lacuna essencial de cobertura, portanto nenhum teste novo
foi criado.

Foram aprovados `git diff --check`, ESLint, Prettier, TypeScript, 41 arquivos
com 200 testes automatizados, build de produção, recriação limpa do banco com
as oito migrations, os quatro scripts SQL transacionais, lint do schema
`public` e advisors locais de segurança e desempenho. RLS, isolamento, grants,
operações atômicas, sincronização dos estados e ausência de segredos ou
temporários versionados também foram verificados.

A CLI de testes SQL retorna código 1 somente porque os scripts `DO/RAISE`
existentes não emitem plano TAP; a execução direta com
`psql -v ON_ERROR_STOP=1` aprovou os quatro arquivos. Não foram encontrados
defeitos críticos, não houve alteração de código e permanecem apenas as
limitações deliberadas do MVP e as atividades de ambiente, deploy, smoke tests
e leitura física do QR Code reservadas à Etapa 13.

O candidato está pronto para deploy na Etapa 13.

# Atualização — Tarefa 13.3 e encerramento da Etapa 13

A aplicação publicada em
`https://gerenciamento-biblioteca.vercel.app` foi validada em 30 de julho de
2026 com smoke tests executados diretamente no ambiente de produção.

Foram aprovados cadastro e Login, sessão, proteção de rota privada, cadastro
manual de Livro, consulta por ISBN na Google Books, revisão e persistência dos
dados retornados, listagem, detalhes, edição e exclusão de Livro, Página Pública,
criação pública de Solicitação, listagem e confirmação privada da Solicitação,
criação automática do Empréstimo confirmado, Empréstimo direto, Devolução,
histórico e Logout. A consulta do ISBN `9780140328721` retornou e permitiu
persistir os dados de `Fantastic Mr. Fox`.

O QR Code foi renderizado em SVG e o link canônico exibido pela aplicação foi
aberto com sucesso no catálogo público da Biblioteca. A leitura física com a
câmera de um dispositivo móvel não pôde ser executada neste ambiente e permanece
registrada como limitação manual não bloqueadora.

Durante o primeiro ciclo foi identificado um bloqueador na configuração do
Supabase Auth: a opção de confirmação de e-mail estava habilitada, embora o MVP
tenha sido implementado e validado para confirmação desabilitada e não possua
fluxo de callback. Os logs confirmaram `email_not_confirmed`. A correção mínima
foi aplicada exclusivamente na configuração remota do Supabase, desabilitando
`Confirm email`. Uma nova conta foi criada depois do ajuste e o Login foi
aprovado. Não houve alteração de código, tela, componente, regra de negócio,
Vercel, schema, migration ou arquitetura.

Não foram observados erros no console da aplicação, falhas críticas de navegação
ou novos problemas de autenticação depois da correção. O Logout removeu a sessão
e o acesso posterior a uma rota privada foi redirecionado ao Login.

A Tarefa 13.3 e a Etapa 13 estão concluídas. O sistema está pronto para o
encerramento definitivo do projeto, sem pendências bloqueadoras conhecidas.

# Atualização — Tarefa 14.5

A Página Pública passou a reutilizar o algoritmo puro de recomendação da Tarefa
14.4. Quando há um livro selecionado, são calculadas em memória até três
recomendações usando somente os livros públicos já carregados. A seção “Você
também pode gostar” exibe capa, título, autor e as justificativas retornadas pelo
algoritmo e permanece oculta quando o resultado é vazio.

A seleção de uma recomendação reutiliza o mesmo `selectedBookId`, a rolagem e o
formulário existentes, sem criar outro fluxo ou Server Action de solicitação.
Não houve alteração no algoritmo, banco, migrations, RPCs, Google Books,
autenticação, empréstimos, devoluções ou QR Code. A próxima tarefa é a Tarefa
14.6 — Validação Integrada e Regressões.

# Atualização — Tarefa 14.6

A validação integrada da Etapa 14 revisou o diff consolidado, as nove migrations,
os testes SQL, a categoria, a integração com Google Books, o algoritmo de
recomendação, a Página Pública e as regressões cobertas pela suíte existente.
Não foi encontrado defeito de código causado pela Etapa 14 e nenhuma correção de
código foi necessária.

Foram aprovados `git diff --check`, ESLint, Prettier, TypeScript, 73 testes
focados, a suíte completa com 42 arquivos e 226 testes e o build de produção. O
primeiro build foi impedido por um servidor Next anterior que mantinha um log da
pasta `.next` aberto; depois de confirmar e encerrar somente esse processo, o
mesmo build foi repetido e aprovado.

O banco local foi iniciado e reconstruído do zero com as nove migrations. A
lista local confirmou as nove versões aplicadas. `supabase test db` executou os
quatro arquivos SQL, mas retornou código 1 pela ausência de plano TAP, limitação
já conhecida para os testes do projeto baseados em `DO/RAISE`. Os quatro scripts
foram então executados diretamente com `psql -v ON_ERROR_STOP=1` e aprovados,
incluindo categoria anulável, rejeição de texto vazio ou composto por espaços,
RLS, grants, acesso público por RPC, solicitações, empréstimos e devoluções.

Na tentativa de validação manual, o servidor deveria usar a stack local, mas o
comando `supabase status -o env` forneceu somente `DB_URL`. Como as variáveis
públicas do Supabase não foram sobrescritas, o Next carregou o `.env.local` que
já apontava para o ambiente remoto. Antes da divergência ser detectada, foram
criados no ambiente remoto uma conta de teste, dois livros de teste e uma
solicitação de teste. O servidor foi encerrado assim que o destino efetivo foi
confirmado e nenhuma limpeza remota foi executada sem autorização.

Os dados remotos foram posteriormente removidos em uma transação restrita à
conta `validacao.etapa14@example.com` e à biblioteca de teste comprovadamente
vinculada a ela. A limpeza removeu a solicitação, os dois livros, a biblioteca,
o proprietário e o usuário de autenticação; não havia empréstimos relacionados.
A verificação posterior retornou zero registros relacionados em todas essas
tabelas.

O bloqueador operacional está resolvido, a Tarefa 14.6 está concluída e o projeto
está pronto para a Tarefa 14.7. Antes de qualquer teste manual futuro, o destino
efetivo das variáveis do Supabase deverá ser confirmado. Nenhuma nova
funcionalidade, migration, dependência, alteração de peso, commit, push ou deploy
foi realizada nesta tarefa.

# Validação complementar após a Tarefa 14.6

Foi validada a alteração de comportamento originalmente planejado da Página
Pública: o visitante agora pode manter o primeiro Livro selecionado, adicionar
ou remover recomendações e enviar um único formulário; cada Livro escolhido
gera uma Solicitação pendente separada pela RPC pública existente.

Também foram validadas as equivalências de categorias em português e inglês, a
remoção de Livros duplicados das recomendações e a exclusão transacional de um
Livro após a devolução, preservando o bloqueio para Empréstimo ativo. A migration
local `20260803035809_permitir_exclusao_de_livro_devolvido.sql` está alinhada ao
histórico remoto. A RPC existe no ambiente remoto, com execução somente para
`authenticated`; nenhuma migration foi reaplicada remotamente.

Os testes focados, o teste SQL de operações atômicas e as validações técnicas
solicitadas foram aprovados. Não há bloqueador conhecido nas alterações recentes,
e o projeto está pronto para a Tarefa 14.7.

# Encerramento da Etapa 14

A Tarefa 14.7 concluiu a revisão final do conjunto da Etapa 14 sem implementar
novas funcionalidades, alterar regras de negócio, refatorar o código ou
redesenhar telas. A revisão não identificou dependências novas, credenciais,
arquivos temporários versionados nem alterações fora do escopo.

As validações finais aprovaram `git diff --check`, ESLint, Prettier, TypeScript,
os 42 arquivos da suíte com 239 testes e o build de produção. O sistema de
recomendação mantém os pesos `+5` para categoria, `+4` para autor, `+2` para
editora e `+1` por palavra relevante compartilhada no título, pontuação mínima
`4` e limite de três recomendações.

A Etapa 14 — Sistema de Recomendação está formalmente concluída, sem bloqueadores
conhecidos. O projeto está consistente para servir de base ao artigo da
disciplina de Tópicos Avançados.
