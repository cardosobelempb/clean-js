# 🧱 4️⃣ Controller HTTP Padrão

## 🎯 Responsabilidade do Controller

> **Traduz HTTP ⇄ Use Case**

✔ Recebe request
✔ Valida formato básico
✔ Chama use case
✔ Converte resposta em HTTP
❌ Não contém regra de negócio

---

## 📁 Estrutura recomendada

```
src/
 ├─ application/
 │   └─ use-cases/
 ├─ interfaces/
 │   └─ http/
 │       ├─ controllers/
 │       │   └─ BookController.ts
 │       └─ presenters/
 │           └─ BookPresenter.ts
 └─ infra/
```

---

## 📘 Controller Base (reutilizável)

### `BaseController.ts`

```ts
/**
 * Controller base
 * Padroniza respostas HTTP
 */
export abstract class BaseController {
  protected ok(data?: unknown) {
    return {
      statusCode: 200,
      body: data
    };
  }

  protected created(data?: unknown) {
    return {
      statusCode: 201,
      body: data
    };
  }

  protected noContent() {
    return {
      statusCode: 204,
      body: null
    };
  }

  protected badRequest(message: string) {
    return {
      statusCode: 400,
      body: { message }
    };
  }

  protected notFound(message: string) {
    return {
      statusCode: 404,
      body: { message }
    };
  }

  protected conflict(message: string) {
    return {
      statusCode: 409,
      body: { message }
    };
  }

  protected serverError(error: Error) {
    return {
      statusCode: 500,
      body: { message: error.message }
    };
  }
}
```

### 💡 Justificativa

- Padroniza respostas
- Evita duplicação
- Facilita troca de framework (Express, Fastify, Nest, Lambda)

---

## 📗 Presenter (anti-vazamento de domínio)

### `BookPresenter.ts`

```ts
import { Book } from '../../../domain/entities/Book';

/**
 * Converte entidade de domínio em DTO de saída
 */
export class BookPresenter {
  static toHTTP(book: Book) {
    return {
      id: book.id,
      title: book.title,
      isbn: book.isbn
    };
  }
}
```

✔ Controller nunca retorna entidade
✔ Protege domínio
✔ Facilita versionamento de API

---

## 📕 BookController

### `BookController.ts`

```ts
import { BaseController } from './BaseController';
import { CreateBookUseCase } from '../../../application/use-cases/book/CreateBookUseCase';
import { FindBookByIsbnUseCase } from '../../../application/use-cases/book/FindBookByIsbnUseCase';
import { BookPresenter } from '../presenters/BookPresenter';
import { BookAlreadyExistsError } from '../../../domain/errors/BookAlreadyExistsError';

/**
 * Controller HTTP de Book
 */
export class BookController extends BaseController {
  constructor(
    private readonly createBook: CreateBookUseCase,
    private readonly findBookByIsbn: FindBookByIsbnUseCase
  ) {
    super();
  }

  async create(request: any) {
    try {
      const { title, isbn } = request.body;

      if (!title || !isbn) {
        return this.badRequest('Título e ISBN são obrigatórios');
      }

      const book = await this.createBook.execute({ title, isbn });

      return this.created(BookPresenter.toHTTP(book));
    } catch (error) {
      if (error instanceof BookAlreadyExistsError) {
        return this.conflict(error.message);
      }

      return this.serverError(error as Error);
    }
  }

  async findByIsbn(request: any) {
    const { isbn } = request.params;

    const book = await this.findBookByIsbn.execute(isbn);

    if (!book) {
      return this.notFound('Livro não encontrado');
    }

    return this.ok(BookPresenter.toHTTP(book));
  }
}
```

---

## ❌ Erros comuns em Controllers

| Erro                           | Impacto              |
| ------------------------------ | -------------------- |
| Regra de negócio no controller | Código duplicado     |
| Acesso direto ao repository    | Quebra arquitetura   |
| Retornar entidade              | Vazamento de domínio |
| Try/catch em todo método       | Código verboso       |

---
