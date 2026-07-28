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

O repositório possui uma aplicação Next.js tipada e preparada para evolução
modular. A implementação consolidada da Etapa 4 inclui as dez telas principais,
a tela auxiliar de Edição de Livro, a navegação-base e componentes visuais
reutilizáveis. As telas utilizam dados simulados e comportamentos locais para
representar integrações e funcionalidades reservadas às etapas posteriores.

As tabelas `proprietarios`, `bibliotecas`, `livros`, `solicitacoes` e
`emprestimos` e suas migrations SQL de domínio foram criadas. O catálogo
persistente possui dados bibliográficos, situação controlada e vínculo
obrigatório com Biblioteca. Solicitações e Empréstimos possuem estados, datas,
relacionamentos com Livro e vínculo opcional entre si. RLS está habilitada nas
cinco tabelas, o vínculo único com `auth.users` sustenta o isolamento privado e
o acesso anônimo está restrito a três RPCs mínimas, sem acesso direto às
tabelas. Nenhuma tela foi conectada ao banco. Autenticação funcional, integração
com a Google Books, QR Code funcional e recursos remotos não foram criados.
Login, Dashboard,
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
- Iniciar a Etapa 6 — Autenticação somente mediante autorização específica.
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

## Próxima etapa recomendada

**Etapa 6 — Autenticação.**

A Etapa 5 está concluída. Cadastro, login, sessão, logout, cliente de servidor e
proteção de rotas continuam pendentes e só deverão ser implementados mediante
autorização específica, seguindo a SDD e o plano técnico oficiais.
