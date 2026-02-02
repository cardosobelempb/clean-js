# 9️⃣ Validação com Schema (Zod como padrão)

## 🎯 Por que validar com schema?

- Evita `if` espalhado em controllers
- Centraliza regras de entrada
- Gera erros claros
- Fácil de testar
- Reutilizável em HTTP, fila, cron, etc.

📌 **Padrão adotado**: `zod`
(leve, tipado e muito usado em produção)

---

## 📁 Estrutura sugerida

```
interfaces/
 └─ http/
    └─ validators/
       └─ CreateBookSchema.ts
```

---

## 📘 Schema de Validação

### `CreateBookSchema.ts`

```ts
import { z } from 'zod';

/**
 * Schema de validação para criação de livro
 * Valida formato e dados obrigatórios
 */
export const CreateBookSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),

  isbn: z.string().length(13, 'ISBN deve conter 13 caracteres')
});
```

---

## 🧱 Helper de Validação Reutilizável

### `validateSchema.ts`

```ts
import { ZodSchema } from 'zod';

/**
 * Valida dados de entrada usando Zod
 * Centraliza tratamento de erro
 */
export function validateSchema<T>(
  schema: ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.errors.map(err => err.message)
    };
  }

  return { success: true, data: result.data };
}
```

---

## 📗 Controller usando Schema

### Trecho do `BookController.ts`

```ts
import { validateSchema } from '../validators/validateSchema';
import { CreateBookSchema } from '../validators/CreateBookSchema';

async create(request: any) {
  try {
    const validation = validateSchema(
      CreateBookSchema,
      request.body
    );

    if (!validation.success) {
      return this.badRequest(validation.errors.join(', '));
    }

    const book = await this.createBook.execute(validation.data);

    return this.created(BookPresenter.toHTTP(book));

  } catch (error) {
    // ...
  }
}
```

---

## ❌ Erros comuns de validação

| Erro                  | Impacto           |
| --------------------- | ----------------- |
| Validar no use case   | Mistura camadas   |
| Validar no repository | Totalmente errado |
| `if` espalhado        | Código difícil    |
| Não tipar validação   | Bugs silenciosos  |

---

## 📈 Impacto técnico

- Controllers menores
- Menos bugs
- Regras de entrada padronizadas
- Tipagem automática

---
