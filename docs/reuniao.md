## Reunião

> somos uma biblioteca pequena e gostariamos de controlar a nossa entarda e sa´da de livros. Quemos cadastrar o usuário que irá pegar o lvro emprestado, cadastrar os livros da nossa biblioteca e poder emprestar para qualquer usuário, além de buscar os registros de empréstimos.

## Dados

- user: [fistName, lastName, CPF, phone, address, email]
- book: [name, quantity, author, gender, ISBN]
- loan: [userId, bookId, returnData, refundDate, deparureDate]

## UseCases (Regra de negócios)

[] Castrar um novo usúario
[] - CPF ou email devem ser únicos

[] Buscar um cadastro de usuário por CPF
[] - Retornar um usuário ou vazio

[] Cadastrar um novo livro
[] - ISBN deve ser único

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

## git

```
git init
git config --global -e

[user]
        email = claudio.c.lima@hotmail.com
        name = cardosobelempb
[pager]
        log = false
        branch = false
[format]
        pretty = oneline
[code]
        editor = code
[alias]
        c = commit -m
        a = add .
        l = log

Como salvar ao editar manualmente (via editor de texto)
Se você editou o arquivo usando git config --global --edit ou git config --local --edit, o editor (como Vim ou Nano) será aberto.
Se for o Vim:
Pressione Esc.
Digite :wq (write & quit).
Pressione Enter.
Se for o VS Code/Notepad:
Apenas salve o arquivo (Ctrl + S) e feche a aba.

```

## Estruturas
