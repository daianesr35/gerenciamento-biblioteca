# SDD- Spec Driven Development

## 8. Especificação SDD

### 8.1 Objetivo da aplicação

O sistema tem como objetivo permitir o gerenciamento de bibliotecas pessoais, facilitando o cadastro e a organização dos livros, o controle de empréstimos e devoluções e a solicitação de empréstimos por terceiros. A solução também busca reduzir o tempo de cadastro dos livros por meio da integração com a Google Books API, permitindo o preenchimento automático das informações a partir do ISBN.

### 8.2 Usuários

#### Proprietário da biblioteca

É o responsável pelo gerenciamento da biblioteca pessoal. Poderá:

- realizar cadastro e login;
- cadastrar livros manualmente ou utilizando a Google Books API;
- editar e excluir livros;
- consultar os livros cadastrados;
- registrar empréstimos e devoluções;
- visualizar solicitações de empréstimo;
- confirmar ou recusar solicitações;
- gerar e compartilhar o QR Code da biblioteca.

#### Solicitante do empréstimo

É a pessoa interessada em pegar emprestado um livro. Poderá:

- acessar o formulário por meio do QR Code;
- pesquisar livros disponíveis;
- selecionar um livro;
- informar nome e telefone;
- enviar uma solicitação de empréstimo.

### 8.3 Telas ou páginas

O protótipo deverá possuir, no mínimo, as seguintes interfaces:

- Tela de cadastro do proprietário.
- Tela de login.
- Página inicial (Dashboard).
- Tela de listagem dos livros.
- Tela de cadastro de livros.
- Tela de edição de livros.
- Tela de consulta automática do livro via ISBN.
- Tela de detalhes do livro.
- Tela de registro de empréstimo.
- Tela de devolução de livro.
- Tela de gerenciamento das solicitações de empréstimo.
- Tela para exibição do QR Code da biblioteca.
- Formulário público de solicitação de empréstimo acessado pelo QR Code.

### 8.4 Dados armazenados

O sistema deverá armazenar as seguintes informações:

#### Proprietário

- Nome
- E-mail
- Senha

#### Livro

- ISBN
- Título
- Autor
- Editora
- Imagem da capa
- Situação (Disponível ou Emprestado)

#### Empréstimo

- Livro
- Nome do solicitante
- Telefone
- Data da solicitação
- Status da solicitação (Pendente, Confirmada ou Recusada)
- Data do empréstimo
- Data da devolução (quando houver)

#### Biblioteca

- Identificador da biblioteca
- QR Code

### 8.5 Ações do usuário

#### Proprietário

- Criar conta.
- Fazer login.
- Cadastrar livros.
- Consultar informações do livro pela Google Books API.
- Revisar os dados retornados pela API.
- Editar livros.
- Excluir livros.
- Visualizar a lista de livros.
- Registrar empréstimos diretamente.
- Registrar devoluções.
- Visualizar solicitações.
- Confirmar solicitações.
- Recusar solicitações.
- Compartilhar o QR Code.
- Encerrar a sessão.

#### Solicitante

- Acessar o formulário por meio do QR Code.
- Pesquisar livros disponíveis.
- Selecionar um livro.
- Informar nome e telefone.
- Enviar solicitação de empréstimo.

### 8.6 Regras de negócio

O sistema deverá respeitar as seguintes regras:

- Apenas usuários autenticados poderão gerenciar a biblioteca.
- Cada proprietário poderá visualizar e gerenciar apenas sua própria biblioteca.
- O cadastro de livros poderá ser realizado automaticamente pela Google Books API ou manualmente.
- Os dados retornados pela API deverão ser revisados antes da confirmação do cadastro.
- Somente livros disponíveis poderão ser solicitados para empréstimo.
- Uma solicitação confirmada altera o status do livro para Emprestado.
- Um livro emprestado não poderá ser confirmado em outra solicitação até que seja devolvido.
- Caso a Google Books API esteja indisponível ou não encontre o livro, o cadastro manual deverá permanecer disponível.
- O QR Code deverá ser único para cada biblioteca.
- Toda solicitação deverá possuir um dos seguintes status:
  - Pendente;
  - Confirmada;
  - Recusada.
- O registro de devolução deverá alterar novamente o status do livro para Disponível.

### 8.7 Fluxos principais

#### Fluxo 1 – Cadastro de livro

1. O proprietário realiza login.
2. Acessa a tela de cadastro.
3. Informa o ISBN ou escolhe o cadastro manual.
4. O sistema consulta a Google Books API.
5. O proprietário revisa os dados.
6. O cadastro é salvo.
7. O livro passa a constar como disponível na biblioteca.

#### Fluxo 2 – Solicitação de empréstimo

1. O interessado acessa o QR Code da biblioteca.
2. O sistema apresenta o formulário de solicitação.
3. O usuário pesquisa um livro disponível.
4. Seleciona o livro.
5. Informa nome e telefone.
6. Envia a solicitação.
7. O sistema registra a solicitação como Pendente.

#### Fluxo 3 – Confirmação do empréstimo

1. O proprietário acessa as solicitações pendentes.
2. Seleciona uma solicitação.
3. O sistema verifica se o livro continua disponível.
4. Caso esteja disponível, o proprietário confirma a solicitação.
5. O sistema altera:
   - status da solicitação para Confirmada;
   - status do livro para Emprestado.
6. Caso o livro não esteja disponível, a confirmação não será permitida.

#### Fluxo 4 – Devolução

1. O proprietário acessa a lista de empréstimos.
2. Seleciona um livro emprestado.
3. Registra a devolução.
4. O sistema altera o status do livro para Disponível.

### 8.8 Critérios de funcionamento

O protótipo será considerado funcional quando for capaz de:

- permitir o cadastro e login do proprietário;
- cadastrar livros manualmente;
- consultar a Google Books API utilizando o ISBN;
- permitir a revisão dos dados antes do cadastro;
- listar, editar e excluir livros;
- indicar corretamente se cada livro está disponível ou emprestado;
- registrar empréstimos e devoluções;
- gerar um QR Code para a biblioteca;
- permitir que um usuário envie uma solicitação de empréstimo pelo QR Code;
- permitir que o proprietário confirme ou recuse solicitações;
- impedir a confirmação de empréstimos para livros indisponíveis;
- manter corretamente o status dos livros e das solicitações durante todo o fluxo de utilização.
