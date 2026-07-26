# Plano de Implementação

Este plano organiza uma sequência lógica de implementação das funcionalidades definidas em [`SDD-sistema.md`](SDD-sistema.md), sem acrescentar novos requisitos.

## Etapa 1 — Cadastro, autenticação e sessão do proprietário

### Objetivo

Permitir que o proprietário crie uma conta, acesse o sistema de forma autenticada e encerre a sessão.

### Funcionalidades envolvidas

- Tela de cadastro do proprietário.
- Tela de login.
- Cadastro do nome, e-mail e senha do proprietário.
- Criação de conta.
- Login.
- Encerramento da sessão.

### Dependências

- Nenhuma etapa funcional anterior.

### Critério para considerar a etapa concluída

A etapa estará concluída quando o proprietário puder criar uma conta, fazer login e encerrar a sessão, e apenas usuários autenticados puderem acessar o gerenciamento da biblioteca.

## Etapa 2 — Biblioteca pessoal e página inicial

### Objetivo

Disponibilizar a biblioteca pessoal do proprietário autenticado e a página inicial do sistema.

### Funcionalidades envolvidas

- Identificador da biblioteca.
- Página inicial (Dashboard).
- Acesso do proprietário à própria biblioteca.

### Dependências

- Etapa 1 — Cadastro, autenticação e sessão do proprietário.

### Critério para considerar a etapa concluída

A etapa estará concluída quando o proprietário autenticado puder acessar a página inicial e visualizar e gerenciar apenas sua própria biblioteca.

## Etapa 3 — Gerenciamento manual de livros

### Objetivo

Permitir o cadastro e a organização manual dos livros da biblioteca.

### Funcionalidades envolvidas

- Tela de listagem dos livros.
- Tela de cadastro de livros.
- Tela de edição de livros.
- Tela de detalhes do livro.
- Cadastro manual de ISBN, título, autor, editora e imagem da capa.
- Consulta dos livros cadastrados.
- Edição de livros.
- Exclusão de livros.
- Indicação da situação do livro como Disponível ou Emprestado.

### Dependências

- Etapa 2 — Biblioteca pessoal e página inicial.

### Critério para considerar a etapa concluída

A etapa estará concluída quando o proprietário puder cadastrar livros manualmente, listar, consultar, editar e excluir livros, e o sistema indicar corretamente a situação de cada livro.

## Etapa 4 — Cadastro de livros pela Google Books API

### Objetivo

Permitir o preenchimento automático das informações do livro a partir do ISBN, mantendo disponível o cadastro manual.

### Funcionalidades envolvidas

- Tela de consulta automática do livro via ISBN.
- Consulta à Google Books API utilizando o ISBN.
- Preenchimento automático das informações do livro.
- Revisão dos dados retornados pela API antes da confirmação do cadastro.
- Cadastro manual quando a API estiver indisponível ou não encontrar o livro.
- Registro do livro como Disponível após o cadastro.

### Dependências

- Etapa 3 — Gerenciamento manual de livros.

### Critério para considerar a etapa concluída

A etapa estará concluída quando o proprietário puder consultar a Google Books API pelo ISBN, revisar os dados retornados antes de salvar o cadastro e continuar utilizando o cadastro manual caso a API esteja indisponível ou não encontre o livro.

## Etapa 5 — Registro direto de empréstimos e devoluções

### Objetivo

Permitir que o proprietário controle empréstimos e devoluções dos livros.

### Funcionalidades envolvidas

- Tela de registro de empréstimo.
- Tela de devolução de livro.
- Registro direto de empréstimos.
- Registro do livro, nome do solicitante, telefone, data do empréstimo e data da devolução, quando houver.
- Alteração da situação do livro para Emprestado.
- Registro de devoluções.
- Alteração da situação do livro para Disponível após a devolução.

### Dependências

- Etapa 3 — Gerenciamento manual de livros.

### Critério para considerar a etapa concluída

A etapa estará concluída quando o proprietário puder registrar empréstimos e devoluções e a situação do livro for mantida corretamente como Emprestado ou Disponível durante esse fluxo.

## Etapa 6 — QR Code e solicitação pública de empréstimo

### Objetivo

Permitir que terceiros acessem a biblioteca por meio do QR Code e enviem solicitações de empréstimo.

### Funcionalidades envolvidas

- Tela para exibição do QR Code da biblioteca.
- Geração de QR Code único para cada biblioteca.
- Compartilhamento do QR Code.
- Formulário público de solicitação de empréstimo acessado pelo QR Code.
- Pesquisa de livros disponíveis.
- Seleção de um livro.
- Informação do nome e telefone do solicitante.
- Envio da solicitação de empréstimo.
- Registro da data da solicitação.
- Registro da solicitação com status Pendente.

### Dependências

- Etapa 2 — Biblioteca pessoal e página inicial.
- Etapa 3 — Gerenciamento manual de livros.

### Critério para considerar a etapa concluída

A etapa estará concluída quando o proprietário puder gerar e compartilhar o QR Code único da biblioteca e um solicitante puder acessá-lo, pesquisar e selecionar um livro disponível, informar nome e telefone e enviar uma solicitação registrada como Pendente.

## Etapa 7 — Gerenciamento das solicitações de empréstimo

### Objetivo

Permitir que o proprietário visualize, confirme ou recuse as solicitações de empréstimo.

### Funcionalidades envolvidas

- Tela de gerenciamento das solicitações de empréstimo.
- Visualização das solicitações.
- Status Pendente, Confirmada ou Recusada para cada solicitação.
- Confirmação de solicitações.
- Recusa de solicitações.
- Verificação da disponibilidade do livro antes da confirmação.
- Alteração do status da solicitação para Confirmada.
- Alteração da situação do livro para Emprestado após a confirmação.
- Impedimento da confirmação quando o livro não estiver disponível.

### Dependências

- Etapa 5 — Registro direto de empréstimos e devoluções.
- Etapa 6 — QR Code e solicitação pública de empréstimo.

### Critério para considerar a etapa concluída

A etapa estará concluída quando o proprietário puder visualizar, confirmar ou recusar solicitações, o sistema impedir a confirmação para livros indisponíveis e os status dos livros e das solicitações forem mantidos corretamente durante todo o fluxo.
