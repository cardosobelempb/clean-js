# 🔁 5️⃣ Pipeline Completo (HTTP → Domínio → DB)

## 🧠 Fluxo oficial

```
HTTP Request
   ↓
Controller
   ↓
Use Case
   ↓
Repository (interface)
   ↓
Repository concreto (infra)
   ↓
Banco de dados
```

---

## 📦 Composition Root (injeção manual)

### `BookModule.ts`

```ts
import { prisma } from '../database/prisma';
import { BookRepository } from '../repositories/BookRepository';
import { CreateBookUseCase } from '../../application/use-cases/book/CreateBookUseCase';
import { FindBookByIsbnUseCase } from '../../application/use-cases/book/FindBookByIsbnUseCase';
import { BookController } from '../../interfaces/http/controllers/BookController';

export function makeBookController() {
  const repository = new BookRepository(prisma.book);

  const createBookUseCase = new CreateBookUseCase(repository);
  const findBookByIsbnUseCase = new FindBookByIsbnUseCase(repository);

  return new BookController(createBookUseCase, findBookByIsbnUseCase);
}
```

✔ Dependências centralizadas
✔ Fácil trocar ORM
✔ Fácil mockar

---

## 🌐 Exemplo com Express

```ts
const bookController = makeBookController();

app.post('/books', async (req, res) => {
  const response = await bookController.create(req);
  res.status(response.statusCode).json(response.body);
});

app.get('/books/:isbn', async (req, res) => {
  const response = await bookController.findByIsbn(req);
  res.status(response.statusCode).json(response.body);
});
```

---

## ⏱️ Complexidade do Pipeline

| Camada     | Complexidade |
| ---------- | ------------ |
| Controller | O(1)         |
| Use Case   | O(1)         |
| Repository | O(1)         |
| Total      | **O(1)**     |

---

## 📌 Checklist Final do Pipeline

```
[ ] Controller não tem regra de negócio
[ ] Use Case orquestra regras
[ ] Repository só acessa dados
[ ] Presenter protege domínio
[ ] Injeção centralizada
[ ] Fácil de testar
```

---

## 🎯 Regra de Ouro da Arquitetura

> **HTTP é detalhe. Domínio é rei.**

---
