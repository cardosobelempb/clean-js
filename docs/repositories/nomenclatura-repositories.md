## 📌 Contexto de Projeto (Realista)

Cenário comum:

- Backend Node.js + TypeScript
- ORM (TypeORM / Prisma / Sequelize)
- Camada de domínio isolada
- Repositories como **contrato** entre domínio e persistência

📁 Estrutura típica:

```
src/
 ├─ domain/
 │   ├─ entities/
 │   ├─ repositories/
 │   │   └─ IBaseRepository.ts
 ├─ infra/
 │   ├─ database/
 │   └─ repositories/
 │       └─ BaseRepository.ts
```

---

# 🎯 Objetivo do Default Repository

Centralizar **operações comuns**:

- CRUD
- Paginação
- Busca por ID
- Existência
- Soft delete
- Transações (quando aplicável)

Sem:

- Vazar ORM
- Misturar regra de negócio
- Criar dependência forte entre entidades

---

# 📘 Guia Oficial de Nomenclatura para Repositories

> **Objetivo**: padronizar nomes, reduzir ambiguidade, facilitar leitura, manutenção e onboarding.

---

## 🎯 Princípios Fundamentais

### 1️⃣ Nome expressa **intenção**, não implementação

O método deve responder claramente:

> _“O que estou buscando e por qual critério?”_

❌ Errado:

```ts
queryBookData();
```

✅ Correto:

```ts
findByIsbn();
```

---

### 2️⃣ Use **linguagem do domínio**

- Use termos que **o negócio usa**
- Evite termos técnicos desnecessários

📌 Exemplo:

```ts
findByIsbn();
```

❌ Não:

```ts
findByBookIdentifierCode();
```

---

### 3️⃣ Repository ≠ Service

- Repository **busca dados**
- Service **decide o que fazer com eles**

❌ Errado:

```ts
findActiveBooks();
```

✅ Correto:

```ts
findByStatus(BookStatus.ACTIVE);
```

---

## 🧠 Estrutura Padrão de Nomes

### 🧱 Verbo + Critério(s)

```
findBy + Atributo(s)
existsBy + Atributo
countBy + Atributo
```

---

## 📗 Verbos Permitidos (e quando usar)

| Verbo    | Uso                 |
| -------- | ------------------- |
| `find`   | Retorna entidade(s) |
| `exists` | Retorna boolean     |
| `count`  | Retorna número      |
| `create` | Persistência        |
| `update` | Atualização         |
| `delete` | Exclusão            |

❌ Evitar:

- `get`
- `fetch`
- `query`
- `load`

💡 **Justificativa**
Esses verbos não expressam claramente intenção nem retorno.

---

## 📘 Atributos: como nomear corretamente

### ✔ Sempre use nomes reais do domínio

| Correto       | Errado            |
| ------------- | ----------------- |
| `Isbn`        | `IsbnName`        |
| `Title`       | `BookName`        |
| `AuthorName`  | `WriterLabel`     |
| `PublishedAt` | `PublishDateInfo` |

---

### ✔ IDs devem ser explícitos

```ts
findByBookId(bookId: string)
```

❌ Nunca:

```ts
findByBook(book: Book)
```

📌 Repository não trabalha com entidades como filtro.

---

## 📕 Uso correto de `And`

Use `And` **somente quando necessário** e com moderação.

### ✅ Bom uso

```ts
findByTitleAndIsbn(title: string, isbn: string)
```

### ❌ Excesso

```ts
findByTitleAndIsbnAndAuthorNameAndYear();
```

💡 **Sinal de alerta**

> Se o nome ficou grande demais → talvez precise de outro método ou critério encapsulado.

---

## 📙 Quando usar métodos genéricos

Use métodos genéricos quando:

- Filtros são opcionais
- Busca é dinâmica
- Evitar explosão de métodos

```ts
findBy(criteria: {
  isbn?: string
  title?: string
  authorName?: string
})
```

⚠️ **Cuidado**

- Menos semântico
- Use apenas quando justificado

---

## 📌 Exemplos Práticos (antes → depois)

### ❌ Ruim

```ts
findByBookAndIsbnName();
```

### ✅ Bons

```ts
findByIsbn(isbn: string)
findByTitleAndIsbn(title: string, isbn: string)
findByBookIdAndIsbn(bookId: string, isbn: string)
existsByIsbn(isbn: string)
```

---

## 🧼 Anti-Padrões Oficiais (proibidos)

❌ `Name`, `Data`, `Info`, `Object`
❌ `get`, `fetch`, `load`
❌ Siglas sem contexto
❌ Misturar regra de negócio no nome
❌ Expor detalhes de banco (`Table`, `Row`, `Column`)

---

## 🧪 Checklist Rápido de Naming (PR)

```
[ ] O nome expressa intenção claramente?
[ ] Usa linguagem do domínio?
[ ] Evita termos técnicos desnecessários?
[ ] Critérios estão explícitos?
[ ] Usa And apenas quando necessário?
[ ] Pode ser entendido sem contexto?
```

- Criar um modelo **replicável para qualquer entidade**

---

# 🧠 Conceito: Use Case vs Service (alinhamento do time)

### 📌 Regra clara (evita discussões infinitas):

- **Use Case** → executa **um caso de uso do negócio**
- **Service** → coordena múltiplos use cases (opcional)

👉 Vamos focar em **Use Case**, que é o mais limpo e previsível.

---

## 📁 Estrutura Recomendada

```
src/
 ├─ domain/
 │   ├─ entities/
 │   ├─ repositories/
 │   └─ errors/
 ├─ application/
 │   └─ use-cases/
 │       └─ book/
 │           ├─ CreateBookUseCase.ts
 │           ├─ FindBookByIsbnUseCase.ts
 │           └─ DeleteBookUseCase.ts
 └─ infra/
     └─ repositories/
```

---

# 🧱 1️⃣ Contratos de Erro de Domínio

### `BookAlreadyExistsError.ts`

```ts
/**
 * Erro de domínio: livro já cadastrado
 */
export class BookAlreadyExistsError extends Error {
  constructor(isbn: string) {
    super(`Livro com ISBN ${isbn} já existe`);
    this.name = 'BookAlreadyExistsError';
  }
}
```

💡 **Por que isso é importante**

- Não usar `throw new Error()`
- Erros viram **parte da linguagem do domínio**
- Facilita tratamento no controller

---

# 📘 2️⃣ Use Case – Criar Livro

### `CreateBookUseCase.ts`

```ts
import { IBookRepository } from '../../domain/repositories/IBookRepository';
import { Book } from '../../domain/entities/Book';
import { BookAlreadyExistsError } from '../../domain/errors/BookAlreadyExistsError';

/**
 * Caso de uso: criar um livro
 * Contém regras de negócio
 */
export class CreateBookUseCase {
  constructor(private readonly bookRepository: IBookRepository) {}

  async execute(input: { title: string; isbn: string }): Promise<Book> {
    // 1️⃣ Regra de negócio: ISBN deve ser único
    const alreadyExists = await this.bookRepository.existsByIsbn(input.isbn);

    if (alreadyExists) {
      throw new BookAlreadyExistsError(input.isbn);
    }

    // 2️⃣ Criação da entidade
    const book = Book.create({
      title: input.title,
      isbn: input.isbn
    });

    // 3️⃣ Persistência
    return this.bookRepository.save(book);
  }
}
```

---

## 🧠 Boas práticas aplicadas

✔ Regra de negócio fora do repository
✔ Use case pequeno e focado (SRP)
✔ Repository só acessa dados
✔ Fácil de testar

---

## ⏱️ Complexidade (Big-O)

| Operação       | Complexidade    |
| -------------- | --------------- |
| `existsByIsbn` | O(1) (indexado) |
| `save`         | O(1)            |
| Total          | **O(1)**        |

---

# 📗 3️⃣ Use Case – Buscar Livro por ISBN

### `FindBookByIsbnUseCase.ts`

```ts
import { IBookRepository } from '../../domain/repositories/IBookRepository';
import { Book } from '../../domain/entities/Book';

/**
 * Caso de uso: buscar livro por ISBN
 */
export class FindBookByIsbnUseCase {
  constructor(private readonly bookRepository: IBookRepository) {}

  async execute(isbn: string): Promise<Book | null> {
    return this.bookRepository.findByIsbn(isbn);
  }
}
```

💡 **Observação**

- Use case pode ser simples
- Não force lógica onde não existe

---

# 📕 4️⃣ Use Case – Remover Livro

### `DeleteBookUseCase.ts`

```ts
import { IBookRepository } from '../../domain/repositories/IBookRepository';

/**
 * Caso de uso: remover livro
 */
export class DeleteBookUseCase {
  constructor(private readonly bookRepository: IBookRepository) {}

  async execute(bookId: string): Promise<void> {
    const exists = await this.bookRepository.existsById(bookId);

    if (!exists) {
      throw new Error('Livro não encontrado');
    }

    await this.bookRepository.delete(bookId);
  }
}
```

---

## ❌ Erros comuns em Use Cases

| Erro                 | Impacto            |
| -------------------- | ------------------ |
| Lógica no controller | Código espalhado   |
| Lógica no repository | Domínio poluído    |
| Use case gigante     | Difícil de testar  |
| `if` demais          | Regra mal modelada |

---

# 🧪 5️⃣ Testabilidade (exemplo rápido)

```ts
const repositoryMock: IBookRepository = {
  findByIsbn: jest.fn(),
  existsByIsbn: jest.fn().mockResolvedValue(false),
  save: jest.fn()
} as any;

const useCase = new CreateBookUseCase(repositoryMock);
```

✔ Sem banco
✔ Sem ORM
✔ Teste rápido e confiável

---

# 📌 Checklist Oficial de Use Case

```
[ ] Um caso de uso por classe
[ ] Regras de negócio ficam aqui
[ ] Repository apenas acessa dados
[ ] Sem dependência de framework
[ ] Fácil de testar
[ ] Nome expressa intenção
```

---

# 🎯 Regra de Ouro

> **Se o método muda o estado do sistema, ele é um Use Case.**

---
