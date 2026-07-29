# Plano técnico de implementação

## 1. Objetivo do plano

Este documento transforma a especificação funcional oficial de
[`SDD-sistema.md`](SDD-sistema.md) em um roteiro técnico incremental e
executável para o Sistema de Gerenciamento de Biblioteca Pessoal.

A SDD define o que o sistema deve fazer. Este plano organiza como o
desenvolvimento será conduzido, sem substituir, ampliar ou alterar os requisitos
funcionais. Decisões definitivas de arquitetura, banco de dados e implementação
devem ser tomadas somente nas etapas às quais pertencem e registradas nos
documentos apropriados.

## 2. Princípios de execução

- Executar exatamente uma etapa por vez.
- Respeitar o escopo, as dependências e os critérios de conclusão da etapa ativa.
- Não antecipar funcionalidades, configurações ou decisões de etapas futuras.
- Consultar a SDD antes de qualquer implementação e preservar integralmente suas
  regras de negócio, fluxos e critérios de funcionamento.
- Não alterar a SDD sem solicitação explícita.
- Manter código, migrations, configurações e documentação consistentes.
- Atualizar `estado-do-projeto.md` ao concluir cada etapa.
- Registrar decisões de arquitetura e banco apenas em suas etapas próprias.
- Validar cada etapa antes de iniciar a seguinte.
- Tratar lint, type check, build e testes como verificações obrigatórias quando
  existirem e forem aplicáveis ao estado do projeto.
- Não incluir requisitos não previstos na SDD.
- Não criar commit, push, recursos remotos ou deploy sem autorização e sem que
  isso faça parte da etapa ativa.

## 3. Módulos principais

Os requisitos da SDD se agrupam nos seguintes módulos:

1. identidade, autenticação e sessão do proprietário;
2. isolamento da biblioteca pessoal;
3. catálogo e cadastro manual de livros;
4. consulta de livros por ISBN na Google Books API;
5. página pública e QR Code da biblioteca;
6. solicitações públicas de empréstimo;
7. gestão de empréstimos, confirmações, recusas e devoluções;
8. qualidade, segurança operacional e entrega.

Esses módulos orientam o plano, mas não determinam antecipadamente componentes,
tabelas, rotas, tecnologias ou provedores.

## 4. Visão geral das etapas

| Nº | Etapa | Status |
|---:|---|---|
| 1 | Inspeção do repositório | Concluída |
| 2 | Criação do plano técnico | Concluída |
| 3 | Definição e implementação da arquitetura base | Concluída |
| 4 | Design do Sistema (UI/UX e Design System) | Concluída |
| 5 | Modelagem do banco de dados | Concluída |
| 6 | Autenticação | Pendente |
| 7 | Cadastro manual de livros | Pendente |
| 8 | Integração com Google Books | Concluída |
| 9 | Página pública da biblioteca e QR Code | Pendente |
| 10 | Solicitações de empréstimo | Pendente |
| 11 | Empréstimos e devoluções | Pendente |
| 12 | Testes | Pendente |
| 13 | Deploy | Pendente |

A sequência proposta foi mantida. Ela cria primeiro a base técnica e os dados,
depois os fluxos privados e públicos, consolida as regras transacionais de
empréstimo, executa a validação abrangente e somente então realiza o deploy.
Testes proporcionais devem acompanhar todas as etapas; a Etapa 12 é a
consolidação da cobertura e a validação integrada, não o primeiro momento de
testar o sistema.

## 5. Detalhamento das etapas

### Etapa 1 — Inspeção do repositório

**Objetivo:** conhecer o estado real do projeto, localizar a fonte oficial de
requisitos e identificar lacunas antes de planejar ou implementar.

**Escopo:**

- inventário dos arquivos e documentos existentes;
- leitura da SDD e das instruções permanentes;
- identificação do estágio atual e das pendências;
- confirmação da ausência de implementação funcional.

**Tarefas técnicas:**

- inspecionar a árvore do repositório e o estado do Git;
- classificar documentação, código e configuração existentes;
- confrontar o conteúdo inicial com a SDD;
- registrar achados, pendências e próxima etapa.

**Dependências:** nenhuma.

**Fora do escopo:**

- definir arquitetura ou tecnologias;
- modelar banco de dados;
- criar código, dependências ou configurações;
- implementar funcionalidades.

**Documentos consultados:** `AGENTS.md`, `SDD-sistema.md`,
`estado-do-projeto.md`, `plano-de-implementacao.md`, `arquitetura.md` e
`banco-de-dados.md`.

**Documentos atualizados:** `estado-do-projeto.md`, conforme o registro da
inspeção.

**Verificações esperadas:**

- revisão do inventário;
- confirmação do estado do Git;
- conferência de que nenhum arquivo funcional foi criado.

**Critérios de aceitação:**

- estado atual e documentação existente identificados;
- ausência de funcionalidades implementadas registrada;
- lacunas de arquitetura, banco e implementação registradas.

**Critério de conclusão:** inspeção documentada com escopo e próxima etapa
definidos.

**Status atual:** **Concluída.** A inspeção constatou documentação inicial,
arquitetura e banco ainda não definidos e nenhuma funcionalidade implementada.

### Etapa 2 — Criação do plano técnico

**Objetivo:** converter a SDD em um roteiro incremental, verificável e limitado
a uma etapa por vez.

**Escopo:**

- identificação dos módulos;
- decomposição das etapas e tarefas;
- dependências, limites, riscos e critérios objetivos;
- estratégia de validação e atualização documental.

**Tarefas técnicas:**

- revisar a sequência de desenvolvimento;
- mapear requisitos, fluxos e regras da SDD às etapas;
- definir entradas, saídas, verificações e conclusão de cada etapa;
- registrar riscos e pendências sem tomar decisões futuras;
- atualizar o estado do projeto.

**Dependências:** Etapa 1.

**Fora do escopo:**

- implementar ou configurar a aplicação;
- escolher definitivamente tecnologias;
- definir schema, tabelas, migrations ou RLS;
- alterar serviços externos;
- avançar para a arquitetura base.

**Documentos consultados:** todos os seis documentos indicados na Etapa 1, com
`SDD-sistema.md` como fonte funcional oficial.

**Documentos atualizados:** `plano-de-implementacao.md` e
`estado-do-projeto.md`.

**Verificações esperadas:**

- revisão de cobertura de todos os requisitos da SDD;
- revisão do diff e do estado do Git;
- confirmação de que apenas documentação autorizada foi alterada;
- confirmação de que a SDD permaneceu inalterada.

**Critérios de aceitação:**

- todas as etapas possuem escopo, tarefas, dependências, validações e conclusão;
- planejamento e implementação estão claramente separados;
- próxima etapa está identificada sem ter sido iniciada.

**Critério de conclusão:** plano e estado do projeto atualizados e revisados.

**Status atual:** **Concluída.**

### Etapa 3 — Definição e implementação da arquitetura base

**Objetivo:** estabelecer a fundação executável e os padrões técnicos necessários
às funcionalidades futuras.

**Escopo:**

- confirmar tecnologias e restrições de execução;
- inicializar ou revisar a aplicação;
- organizar diretórios e responsabilidades;
- definir configuração de ambiente e padrão de acesso ao backend;
- configurar ferramentas de qualidade e fluxo local.

**Tarefas técnicas:**

- documentar requisitos arquiteturais derivados da SDD;
- avaliar e registrar as escolhas de frontend, backend, autenticação, banco e
  hospedagem;
- criar a estrutura mínima da aplicação, sem telas funcionais de negócio;
- separar configurações públicas e segredos;
- definir estratégia de rotas privadas e públicas em nível arquitetural;
- configurar lint, type check, build e estrutura inicial de testes;
- definir o padrão de integração com Supabase, se confirmado nessa etapa;
- fornecer exemplo seguro das variáveis necessárias, sem valores secretos.

**Dependências:** Etapa 2.

**Fora do escopo:**

- schema definitivo, tabelas, migrations e políticas RLS;
- autenticação funcional;
- telas ou regras de catálogo e empréstimo;
- integração funcional com Google Books;
- QR Code e deploy de produção.

**Documentos consultados:** `AGENTS.md`, `SDD-sistema.md`,
`estado-do-projeto.md`, este plano e `arquitetura.md`.

**Documentos atualizados:** `arquitetura.md`, `estado-do-projeto.md`, este plano
se uma dependência comprovadamente mudar e documentação operacional mínima
criada pela arquitetura.

**Verificações esperadas:**

- instalação/reprodutibilidade das dependências, se autorizada;
- lint;
- type check;
- build;
- teste mínimo de inicialização;
- inspeção para impedir exposição de segredos.

**Critérios de aceitação:**

- escolhas técnicas justificadas e documentadas;
- aplicação base executa e compila;
- diretórios e padrões permitem evoluir sem antecipar módulos;
- ferramentas de qualidade estão executáveis;
- nenhum requisito funcional foi implementado prematuramente.

**Critério de conclusão:** arquitetura base implementada, documentada e aprovada
pelas verificações aplicáveis.

**Status atual:** **Concluída.** Arquitetura documentada e fundação executável
implementada com Next.js, TypeScript, Supabase, ferramentas de qualidade e
configuração segura, sem funcionalidades de negócio.

### Etapa 4 — Design do Sistema (UI/UX e Design System)

**Objetivo:** definir e implementar a base visual, os padrões de interação e o
Design System que orientarão as interfaces da aplicação nas etapas funcionais
seguintes.

**Escopo:**

- identidade visual da aplicação;
- paleta de cores e tipografia;
- escala de espaçamentos;
- conjunto e padrão de uso de ícones;
- componentes visuais reutilizáveis;
- layouts principais e estrutura de navegação;
- comportamento responsivo;
- estados visuais de carregamento, erro, vazio e sucesso;
- documentação do Design System.

**Tarefas técnicas:**

- definir os princípios visuais e de experiência coerentes com o sistema;
- estabelecer tokens de cores, tipografia, espaçamentos, bordas, raios, sombras
  e demais propriedades visuais necessárias;
- selecionar ou definir o conjunto de ícones e suas regras de aplicação;
- especificar e implementar os componentes reutilizáveis fundamentais, sem
  incorporar regras de negócio;
- definir os layouts-base para áreas autenticadas e públicas;
- definir a hierarquia e os padrões de navegação;
- estabelecer breakpoints e comportamentos responsivos;
- implementar padrões visuais acessíveis para carregamento, erro, vazio e
  sucesso;
- documentar tokens, componentes, variantes, estados e exemplos de uso;
- criar uma forma isolada de visualizar e verificar os elementos do Design
  System, de acordo com a arquitetura adotada.

**Dependências:** Etapa 3.

**Fora do escopo:**

- modelagem ou alteração do banco de dados;
- autenticação funcional;
- implementação dos fluxos de catálogo, Google Books, página pública,
  solicitações, empréstimos ou devoluções;
- definição de novos requisitos funcionais;
- conteúdo definitivo ou integrações com serviços externos.

**Documentos consultados:** `AGENTS.md`, `SDD-sistema.md`,
`estado-do-projeto.md`, este plano e `arquitetura.md`.

**Documentos atualizados:** documentação do Design System,
`estado-do-projeto.md` e `arquitetura.md` somente se a implementação visual
exigir o registro de decisão arquitetural.

**Verificações esperadas:**

- lint;
- type check;
- build;
- testes dos componentes visuais quando aplicáveis;
- revisão visual dos componentes, variantes e estados;
- validação da responsividade nos breakpoints definidos;
- verificação de contraste, foco visível, navegação por teclado e semântica
  básica;
- conferência da consistência entre implementação e documentação.

**Critérios de aceitação:**

- identidade visual, cores, tipografia, espaçamentos e ícones estão definidos;
- componentes fundamentais possuem variantes e estados documentados;
- layouts e navegação-base estão definidos sem regras funcionais antecipadas;
- comportamento responsivo está especificado e validado;
- estados de carregamento, erro, vazio e sucesso possuem padrões consistentes;
- base visual atende às verificações de acessibilidade previstas;
- documentação permite reutilizar o Design System nas etapas seguintes.

**Critério de conclusão:** base visual implementada, documentada e validada,
pronta para ser reutilizada pelas funcionalidades futuras, sem antecipar suas
regras de negócio.

**Status atual:** **Concluída.** Design System, componentes compartilhados,
layouts, navegação-base, responsividade e acessibilidade visual implementados,
documentados e validados, mantendo dados e comportamentos exclusivamente
simulados.

### Etapa 5 — Modelagem do banco de dados

**Objetivo:** transformar os dados e regras da SDD em um modelo persistente,
seguro, versionado e adequado aos fluxos previstos.

**Escopo:**

- entidades de proprietário, biblioteca, livro e registros necessários aos
  empréstimos/solicitações;
- relacionamentos, restrições, estados e integridade;
- isolamento por proprietário e acesso público mínimo;
- migrations e políticas RLS.

**Tarefas técnicas:**

- mapear os dados obrigatórios da SDD e seus ciclos de vida;
- definir tabelas, colunas, chaves, relacionamentos e nulabilidade;
- definir representação dos estados permitidos;
- estabelecer unicidade da biblioteca por seu identificador público;
- definir regras que apoiem disponibilidade, confirmação e devolução;
- projetar índices a partir das consultas esperadas;
- especificar e implementar RLS para isolamento da biblioteca;
- limitar o acesso público aos livros disponíveis e à criação válida de
  solicitações;
- criar migrations reproduzíveis e dados mínimos de teste apenas se necessários;
- documentar decisões e procedimento de aplicação/reversão.

**Dependências:** Etapa 3.

**Fora do escopo:**

- telas e fluxos de autenticação;
- CRUD visual de livros;
- chamadas à Google Books;
- QR Code e fluxos completos de empréstimo;
- dados reais de produção.

**Documentos consultados:** `SDD-sistema.md`, `arquitetura.md`,
`banco-de-dados.md`, este plano e `estado-do-projeto.md`.

**Documentos atualizados:** `banco-de-dados.md`, `estado-do-projeto.md` e
histórico/guia de migrations definido pela arquitetura.

**Verificações esperadas:**

- aplicação das migrations em ambiente limpo;
- validação das restrições e relacionamentos;
- testes positivos e negativos das políticas RLS;
- verificação de isolamento entre dois proprietários;
- verificação do acesso público mínimo;
- lint, type check e build se houver código alterado.

**Critérios de aceitação:**

- todos os dados exigidos pela SDD podem ser persistidos;
- estados inválidos e acesso cruzado são impedidos;
- migrations reproduzem o modelo;
- RLS protege dados privados e não amplia o acesso público;
- decisões estão documentadas.

**Critério de conclusão:** modelo versionado, documentado e validado em ambiente
de desenvolvimento, sem implementação dos fluxos de interface.

**Status atual:** **Concluída.** Modelo persistente, migrations, vínculo com
`auth.users`, RLS, isolamento por Proprietário e acesso público mínimo
implementados e validados.

### Etapa 6 — Autenticação

**Objetivo:** permitir cadastro, login, sessão e logout do proprietário, com
acesso privado somente à própria biblioteca.

**Escopo:**

- cadastro com nome, e-mail e senha;
- login, manutenção de sessão e encerramento;
- criação/associação da biblioteca pessoal;
- proteção do gerenciamento privado.

**Tarefas técnicas:**

- implementar telas e validações de cadastro e login;
- integrar o provedor de autenticação definido;
- persistir o nome e associar o usuário à sua biblioteca;
- implementar restauração e encerramento de sessão;
- proteger rotas e operações privadas;
- tratar erros previsíveis sem revelar informação sensível;
- validar isolamento entre proprietários.

**Dependências:** Etapas 3 e 5.

**Fora do escopo:**

- recuperação de senha, autenticação social ou perfis adicionais, pois não constam
  na SDD;
- CRUD de livros;
- página pública, solicitações e empréstimos.

**Documentos consultados:** `SDD-sistema.md`, `arquitetura.md`,
`banco-de-dados.md`, este plano e documentação oficial da tecnologia escolhida.

**Documentos atualizados:** `estado-do-projeto.md`, `arquitetura.md` se houver
decisão nova, e `banco-de-dados.md` se houver ajuste aprovado no modelo.

**Verificações esperadas:**

- lint, type check e build;
- testes unitários das validações;
- testes de integração de cadastro, login, sessão e logout;
- teste funcional de proteção de rota;
- teste de acesso cruzado e políticas RLS.

**Critérios de aceitação:**

- proprietário cria conta, autentica-se e encerra a sessão;
- usuário não autenticado não gerencia biblioteca;
- proprietário acessa somente a própria biblioteca;
- credenciais e tokens não são expostos.

**Critério de conclusão:** fluxo completo de autenticação validado e documentado,
sem antecipar catálogo.

**Status atual:** **Pendente.**

### Etapa 7 — Cadastro manual de livros

**Objetivo:** permitir ao proprietário manter manualmente o catálogo de sua
biblioteca.

**Escopo:**

- listagem, cadastro, detalhes, edição e exclusão;
- ISBN, título, autor, editora e imagem da capa;
- exibição da situação Disponível ou Emprestado;
- livro novo registrado como Disponível.

**Tarefas técnicas:**

- criar as interfaces mínimas previstas na SDD para o catálogo;
- implementar formulários e validações dos campos;
- implementar operações de consulta e mutação restritas ao proprietário;
- apresentar estado vazio, carregamento e erros;
- garantir situação inicial Disponível;
- impedir que o cliente contorne regras de propriedade ou integridade;
- definir comportamento seguro de exclusão diante de dados relacionados com base
  no modelo aprovado, sem inventar fluxo funcional.

**Dependências:** Etapas 5 e 6.

**Fora do escopo:**

- preenchimento pela Google Books;
- registro de empréstimos e devoluções;
- página pública, QR Code e solicitações;
- novos campos não exigidos pela SDD.

**Documentos consultados:** `SDD-sistema.md`, `arquitetura.md`,
`banco-de-dados.md`, este plano e `estado-do-projeto.md`.

**Documentos atualizados:** `estado-do-projeto.md`; `arquitetura.md` ou
`banco-de-dados.md` apenas para decisões/ajustes efetivamente realizados.

**Verificações esperadas:**

- lint, type check e build;
- testes unitários de validação e transformação;
- testes de integração do CRUD e RLS;
- testes funcionais das cinco interfaces do catálogo;
- validação manual de cadastro, consulta, edição, exclusão e situação inicial.

**Critérios de aceitação:**

- proprietário mantém os campos previstos pela SDD;
- catálogo exibe situação correta;
- novo livro inicia Disponível;
- operações de outro proprietário são inacessíveis;
- falhas apresentam resposta compreensível e não corrompem dados.

**Critério de conclusão:** CRUD manual completo, isolado e validado, sem consulta
externa por ISBN.

**Status atual:** **Pendente.**

### Etapa 8 — Integração com Google Books

**Objetivo:** reduzir o preenchimento manual consultando informações do livro por
ISBN, sem tornar o serviço externo obrigatório.

**Escopo:**

- consulta à Google Books API por ISBN;
- mapeamento dos campos previstos;
- revisão e edição antes do salvamento;
- fallback integral para cadastro manual.

**Tarefas técnicas:**

- definir o ponto de integração conforme a arquitetura;
- validar e normalizar o ISBN antes da consulta;
- mapear resposta, ausência de dados, livro não encontrado e indisponibilidade;
- preencher apenas os campos suportados pela SDD;
- manter os dados editáveis antes da confirmação;
- garantir que a consulta não salve automaticamente;
- preservar o formulário manual em toda condição de falha;
- evitar exposição de eventual segredo e dependência rígida do serviço.

**Dependências:** Etapa 7.

**Fora do escopo:**

- novas fontes bibliográficas;
- sincronização contínua;
- cadastro automático sem revisão;
- solicitações ou empréstimos.

**Documentos consultados:** `SDD-sistema.md`, `arquitetura.md`, este plano,
documentação oficial da Google Books API e documentos do catálogo.

**Documentos atualizados:** `estado-do-projeto.md`, `arquitetura.md` na seção de
integrações e documentação de ambiente se aplicável.

**Verificações esperadas:**

- lint, type check e build;
- testes unitários do mapeamento e normalização;
- testes de integração com respostas simuladas;
- testes funcionais de sucesso, não encontrado, resposta parcial, erro e timeout;
- validação manual da revisão antes de salvar e do fallback manual.

**Critérios de aceitação:**

- consulta válida preenche dados disponíveis;
- proprietário revisa e pode editar antes de salvar;
- nenhuma consulta cria livro sem confirmação;
- falha externa não impede o cadastro manual;
- livro confirmado inicia Disponível.

**Status atual:** **Concluída em 29 de julho de 2026.** A consulta server-side
por ISBN, o preenchimento editável, o fallback manual e a separação entre
consulta e persistência foram implementados. O encerramento confirmou 24
arquivos e 150 testes aprovados, além de lint, formatação, TypeScript e build de
produção.

**Critério de conclusão:** integração resiliente e validada sem criar dependência
obrigatória para o cadastro.

**Status atual:** **Pendente.**

### Etapa 9 — Página pública da biblioteca e QR Code

**Objetivo:** fornecer um acesso público identificável à biblioteca e um QR Code
único que direcione para esse acesso.

**Escopo:**

- rota pública baseada no identificador da biblioteca;
- pesquisa/listagem pública somente de livros disponíveis;
- geração e exibição do QR Code correspondente;
- compartilhamento do destino público pelo proprietário.

**Tarefas técnicas:**

- implementar resolução segura do identificador público;
- expor somente os dados necessários ao fluxo do solicitante;
- implementar busca de livros disponíveis;
- impedir operações administrativas na área pública;
- gerar QR Code a partir da URL canônica da biblioteca;
- garantir correspondência estável e única entre biblioteca, URL e QR Code;
- validar estados de biblioteca inexistente e sem livros disponíveis.

**Dependências:** Etapas 5, 6 e 7. A integração da Etapa 8 não é dependência
funcional, mas permanece anterior para manter uma entrega incremental linear.

**Fora do escopo:**

- envio da solicitação;
- confirmação, recusa, empréstimo ou devolução;
- exposição pública do catálogo indisponível ou de dados do proprietário não
  exigidos pela SDD.

**Documentos consultados:** `SDD-sistema.md`, `arquitetura.md`,
`banco-de-dados.md`, este plano e `estado-do-projeto.md`.

**Documentos atualizados:** `estado-do-projeto.md`; documentos de arquitetura e
banco apenas se decisões efetivas exigirem atualização.

**Verificações esperadas:**

- lint, type check e build;
- testes unitários da formação/validação da URL;
- testes de integração de consulta pública e RLS;
- teste funcional da pesquisa;
- leitura do QR Code por leitor compatível e conferência do destino;
- teste de não exposição de dados privados ou livros emprestados.

**Critérios de aceitação:**

- cada biblioteca tem destino e QR Code únicos;
- QR Code abre a biblioteca correta;
- público pesquisa apenas livros disponíveis;
- área pública não permite gerenciamento nem revela dados privados.

**Critério de conclusão:** página pública e QR Code funcionais e validados, sem
criação de solicitações.

**Status atual:** **Pendente.**

### Etapa 10 — Solicitações de empréstimo

**Objetivo:** permitir que um solicitante, sem autenticação administrativa, envie
uma solicitação para um livro disponível e que o proprietário a gerencie.

**Escopo:**

- seleção pública de livro disponível;
- nome, telefone e data da solicitação;
- criação com status Pendente;
- listagem privada;
- confirmação ou recusa;
- verificação da disponibilidade no momento da confirmação.

**Tarefas técnicas:**

- implementar formulário público e validações;
- restringir livros selecionáveis aos disponíveis da biblioteca acessada;
- registrar data e status inicial de forma confiável;
- limitar a operação pública ao mínimo necessário;
- implementar listagem privada de solicitações do proprietário;
- implementar recusa e confirmação;
- tornar a confirmação atômica com a alteração do livro para Emprestado;
- impedir confirmação concorrente ou repetida de livro indisponível;
- manter os estados somente em Pendente, Confirmada ou Recusada.

**Dependências:** Etapas 6 e 9, além do modelo da Etapa 5. Depende também do
controle de disponibilidade definido para livros.

**Fora do escopo:**

- notificações, reservas, filas ou cancelamento pelo solicitante;
- múltiplos livros por solicitação, não previstos na SDD;
- devolução e registro direto pelo proprietário, tratados na Etapa 11.

**Documentos consultados:** `SDD-sistema.md`, `arquitetura.md`,
`banco-de-dados.md`, este plano e `estado-do-projeto.md`.

**Documentos atualizados:** `estado-do-projeto.md`; `arquitetura.md` e
`banco-de-dados.md` se decisões implementadas modificarem seus registros.

**Verificações esperadas:**

- lint, type check e build;
- testes unitários de validação e transições;
- testes de integração do acesso público, RLS e operação atômica;
- teste concorrente de duas confirmações para o mesmo livro;
- testes funcionais de envio, listagem, confirmação e recusa;
- validação manual dos estados e da indisponibilidade após confirmação.

**Critérios de aceitação:**

- somente livro disponível pode ser solicitado;
- solicitação nasce Pendente com nome, telefone e data;
- proprietário vê e gerencia somente suas solicitações;
- confirmação altera solicitação e livro de modo consistente;
- livro indisponível não pode ser confirmado novamente;
- recusa produz o estado correto sem emprestar o livro.

**Critério de conclusão:** fluxo público e gestão privada de solicitações
validados, incluindo concorrência e segurança.

**Status atual:** **Pendente.**

### Etapa 11 — Empréstimos e devoluções

**Objetivo:** completar o controle do ciclo do empréstimo, incluindo registro
direto pelo proprietário e devolução.

**Escopo:**

- registro direto com livro, nome, telefone e data do empréstimo;
- visualização dos empréstimos necessários à devolução;
- data da devolução quando houver;
- sincronização da situação do livro.

**Tarefas técnicas:**

- implementar interface de registro direto para livro disponível;
- persistir os dados exigidos pela SDD;
- alterar livro para Emprestado de modo atômico;
- apresentar os registros necessários ao fluxo de devolução;
- implementar devolução idempotente ou protegida contra repetição;
- registrar a data e alterar o livro para Disponível atomicamente;
- aplicar a mesma regra de disponibilidade a empréstimos diretos e confirmados;
- validar que empréstimos de outra biblioteca não podem ser vistos ou alterados.

**Dependências:** Etapas 7 e 10. A gestão de disponibilidade e o modelo aprovado
na Etapa 5 são pré-requisitos.

**Fora do escopo:**

- multas, prazos, renovações, notificações ou histórico analítico não previstos;
- mudanças nos estados oficiais de solicitação;
- funcionalidades de inventário além da SDD.

**Documentos consultados:** `SDD-sistema.md`, `arquitetura.md`,
`banco-de-dados.md`, este plano e `estado-do-projeto.md`.

**Documentos atualizados:** `estado-do-projeto.md`; documentação de arquitetura
e banco para decisões efetivamente adotadas.

**Verificações esperadas:**

- lint, type check e build;
- testes unitários das transições de disponibilidade;
- testes de integração das operações atômicas e RLS;
- testes concorrentes para registros sobre o mesmo livro;
- testes funcionais de registro direto e devolução;
- validação manual das datas e situações.

**Critérios de aceitação:**

- proprietário registra empréstimo direto somente para livro disponível;
- livro emprestado não admite outro empréstimo/confirmação;
- devolução registra a data e torna o livro Disponível;
- dados e operações permanecem isolados por biblioteca;
- falha parcial não deixa livro e empréstimo inconsistentes.

**Critério de conclusão:** todos os fluxos de empréstimo e devolução da SDD
funcionam de forma consistente e segura.

**Status atual:** **Pendente.**

### Etapa 12 — Testes

**Objetivo:** consolidar a qualidade do sistema completo e demonstrar que os
critérios de funcionamento da SDD são atendidos.

**Escopo:**

- revisão da cobertura acumulada;
- testes unitários, integração e funcionais faltantes;
- regressão dos fluxos principais;
- segurança, RLS, concorrência e falhas externas;
- build candidato a produção.

**Tarefas técnicas:**

- criar matriz de rastreabilidade entre SDD e testes;
- revisar cenários positivos, negativos, limites e autorização;
- cobrir cadastro/login, catálogo manual e via ISBN;
- cobrir QR Code, página pública e solicitações;
- cobrir confirmação, recusa, registro direto e devolução;
- validar indisponibilidade e concorrência;
- validar fallback da Google Books;
- corrigir apenas defeitos identificados, sem acrescentar funcionalidades;
- registrar limitações conhecidas e evidências de execução.

**Dependências:** Etapas 3 a 11.

**Fora do escopo:**

- novas funcionalidades;
- mudanças arquiteturais sem relação com defeito comprovado;
- deploy de produção.

**Documentos consultados:** `SDD-sistema.md`, todos os documentos técnicos,
este plano e documentação dos testes existente.

**Documentos atualizados:** `estado-do-projeto.md`, documentação/relatório de
testes e documentos técnicos somente quando uma correção os afetar.

**Verificações esperadas:**

- lint;
- type check;
- build de produção;
- suíte unitária;
- suíte de integração;
- suíte funcional ponta a ponta;
- aplicação das migrations em ambiente limpo;
- matriz de testes de RLS;
- validação manual exploratória dos quatro fluxos principais.

**Critérios de aceitação:**

- todos os critérios de funcionamento da SDD possuem evidência;
- verificações automatizadas passam;
- migrations e RLS são reproduzíveis e seguras;
- não existem defeitos bloqueadores conhecidos;
- limitações não bloqueadoras estão documentadas.

**Critério de conclusão:** candidato a release validado de ponta a ponta e com
evidências registradas.

**Status atual:** **Pendente.**

### Etapa 13 — Deploy

**Objetivo:** publicar de forma controlada a versão validada e comprovar seu
funcionamento no ambiente de destino.

**Escopo:**

- preparação e validação do ambiente;
- configuração segura de variáveis;
- aplicação controlada de migrations;
- build e publicação;
- verificações pós-deploy e procedimento de recuperação.

**Tarefas técnicas:**

- confirmar provedor e procedimento definidos na arquitetura;
- validar separação entre ambientes e valores de configuração;
- provisionar/configurar recursos estritamente necessários;
- aplicar migrations na ordem versionada e verificar RLS;
- executar build imutável e publicar;
- validar URLs públicas, callbacks e URL usada pelo QR Code;
- executar smoke tests dos fluxos críticos;
- registrar versão, evidências, rollback e pendências.

**Dependências:** Etapa 12 concluída sem bloqueadores.

**Fora do escopo:**

- adicionar funcionalidades;
- corrigir problemas por alteração não rastreada diretamente em produção;
- expor segredos em repositório, logs ou cliente;
- mudanças de schema fora das migrations aprovadas.

**Documentos consultados:** `SDD-sistema.md`, `arquitetura.md`,
`banco-de-dados.md`, este plano, `estado-do-projeto.md` e documentação oficial
dos provedores confirmados.

**Documentos atualizados:** `estado-do-projeto.md`, documentação operacional de
deploy/rollback e documentos técnicos afetados pela configuração final.

**Verificações esperadas:**

- lint, type check, testes e build no pipeline;
- verificação das migrations e RLS no ambiente;
- smoke tests de autenticação, catálogo, página pública, solicitação e devolução;
- leitura do QR Code apontando para a URL de produção;
- inspeção de logs sem segredos;
- exercício ou validação documentada do rollback.

**Critérios de aceitação:**

- versão validada está acessível no ambiente de destino;
- banco e políticas correspondem às migrations aprovadas;
- segredos estão protegidos;
- fluxos críticos e QR Code funcionam em produção;
- procedimento de recuperação e versão implantada estão registrados.

**Critério de conclusão:** deploy concluído, verificado e documentado, sem
pendências bloqueadoras.

**Status atual:** **Pendente.**

## 6. Dependências entre etapas

O encadeamento principal é:

`1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13`

As dependências funcionais mais importantes são:

- a arquitetura base depende do plano aprovado;
- o banco depende dos padrões e tecnologias definidos na arquitetura;
- autenticação depende da arquitetura e do banco;
- cadastro manual depende da autenticação e das tabelas necessárias;
- Google Books depende do formulário e persistência do cadastro manual;
- a página pública depende da identificação da biblioteca, dos livros e das
  políticas de acesso;
- solicitações dependem da página pública, da disponibilidade e da autenticação
  para o gerenciamento privado;
- empréstimos e devoluções dependem do catálogo, das solicitações e do controle
  consistente de disponibilidade;
- testes consolidados dependem de todos os fluxos implementados;
- deploy depende de candidato aprovado pelos testes.

Embora a Etapa 8 não seja uma dependência técnica obrigatória da página pública,
ela permanece antes da Etapa 9 para preservar a sequência incremental solicitada
e concluir o fluxo de cadastro antes dos fluxos públicos.

## 7. Estratégia de validação

Cada etapa deve produzir evidência proporcional ao que alterou:

- **Etapas documentais:** leitura cruzada, revisão de diff, conferência de links,
  escopo e estado do Git.
- **Arquitetura:** lint, type check, build e inicialização mínima.
- **Banco:** migrations em ambiente limpo, restrições, índices quando aplicáveis,
  testes de RLS e isolamento.
- **Funcionalidades:** testes unitários das regras locais, integração das
  fronteiras e fluxos funcionais completos da etapa.
- **Integrações externas:** respostas simuladas, erros, timeout, dados parciais e
  fallback.
- **Operações de estado:** cenários concorrentes e verificação de atomicidade.
- **Deploy:** pipeline completo, migrations, RLS, smoke tests e rollback.

Nenhuma verificação deve ser marcada como aprovada sem execução. Caso uma
ferramenta ainda não exista, a etapa deve registrar “não aplicável” com
justificativa, em vez de simular resultado. Falhas bloqueadoras impedem o avanço;
falhas não bloqueadoras precisam de justificativa, risco e pendência registrada.

## 8. Riscos e cuidados

| Risco | Cuidado preventivo |
|---|---|
| Inconsistência entre SDD, documentação e código | Rastrear cada entrega à SDD e atualizar documentos na mesma etapa. |
| Criação prematura de funcionalidades | Respeitar “fora do escopo” e concluir uma etapa por vez. |
| Decisões definitivas tomadas durante o planejamento | Adiar escolhas para arquitetura ou banco e registrar apenas critérios. |
| Exposição de chaves, senhas ou tokens | Usar variáveis de ambiente, exemplos sem valores e inspeção de artefatos/logs. |
| Alterações não controladas no banco | Usar migrations versionadas, revisão e teste em ambiente limpo. |
| RLS ausente ou incorreta | Testar acesso anônimo, autenticado, cruzado e operações negadas. |
| Acesso público excessivo | Expor somente dados e operações mínimos do fluxo da SDD. |
| Condição de corrida na confirmação/empréstimo | Usar operação atômica e teste concorrente sobre o mesmo livro. |
| Inconsistência entre empréstimo e situação do livro | Validar transições e realizar mudanças relacionadas atomicamente. |
| Dependência excessiva da Google Books | Manter cadastro manual sempre disponível e testar falhas/timeouts. |
| QR Code apontando para ambiente ou biblioteca errados | Gerar a partir da URL canônica e validar leitura em cada ambiente. |
| Falta de validação antes do deploy | Impedir deploy sem suíte, build e critérios da Etapa 12 aprovados. |
| Alteração indevida da SDD | Tratar o documento como somente leitura sem solicitação explícita. |
| Ampliação acidental de requisitos | Recusar campos, papéis e fluxos não previstos ou submetê-los a nova solicitação. |

## 9. Pendências atuais

- As tecnologias e a arquitetura base foram definidas na Etapa 3.
- O projeto executável e as ferramentas de qualidade foram configurados.
- O Design System e as interfaces simuladas foram concluídos na Etapa 4.
- O banco, as migrations e as políticas RLS foram modelados e validados na
  Etapa 5.
- Todas as funcionalidades da SDD permanecem não implementadas.
- A escolha/configuração de serviços externos e ambientes permanece para as
  etapas correspondentes.

As pendências funcionais permanecem reservadas às respectivas etapas e não foram
antecipadas durante a Etapa 4.

## 10. Próxima etapa recomendada

A próxima etapa é a **Etapa 6 — Autenticação**.
