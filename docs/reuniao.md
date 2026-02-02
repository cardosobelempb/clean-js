## Reunião

> somos uma biblioteca pequena e gostariamos de controlar a nossa entarda e sa´da de livros. Quemos cadastrar o usuário que irá pegar o lvro emprestado, cadastrar os livros da nossa biblioteca e poder emprestar para qualquer usuário, além de buscar os registros de empréstimos.

## Dados

- user: [fistName, lastName, CPF, phone, address, email]
- book: [name, quantity, author, gender, ISBN]
- loan: [userId, bookId, returnData, refundDate, deparureDate]

## UseCases (Regra de negócios)

[X] Castrar um novo usúario
[X] - CPF ou email devem ser únicos

[X] Buscar um cadastro de usuário por CPF
[X] - Retornar um usuário ou vazio

[X] Cadastrar um novo livro
[X] - ISBN deve ser único

[] Buscar um livro por nome ou ISBN
[] Retornar um livro ao usuario

[] Emprestar um livro ao usuário
[] - A data de retorno não pode ser menor que a data de saída
[] - um usuário não pode estar com mais de um livro com o mesmo ISBN ao mesmo tempo
[] - um usuario pode estar com mais de um livro com IBNS fifeente ao mesmo tempo
[] - ao cadastrar um emprestiomo, sera enviado um email automaticamente informando o nome do livro, nome do SPF, a data de saida e a data de reorno

[] devolver o livro emprestado
[] - caso o usuario tenha atrasado, será gerado uma multa fixa de R$ 10,00

[] - mostrar todos os emprestiomos pendente, com o nome do livro, name do usuario, CPF, data de saida e data de retorno ordenados pela data de retorno mais aontiga

## Estruturas

## UserRepository

```js
[] create: ({firstName, lastName, cpf, phone, address, email}) => Promise<void>
[] existeCpf(cpf) = Prmise<boolean>
[] existeEmail(email) = Prmise<boolean>
```

## BookRepository

```js
[] create: ({name, quantity, author, gender, isbn}) => Promise<void>
[] existeIsbn(isbn) = Prmise<boolean>
```
