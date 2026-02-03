Boa 😄 então vamos **até o fim**, do jeito que isso seria feito em um projeto **real, escalável e didático**, sem pular etapas.

Vou entregar **3 coisas** bem práticas:

1. ✅ **SearchCriteria genérico reutilizável**
2. ✅ **Implementação com Prisma**
3. ✅ **Encaixe em Clean Architecture**
4. ✅ **Erros comuns, impactos e recomendações**

---

# 1️⃣ SearchCriteria genérico (nível sênior, reutilizável)

## 🎯 Problema que estamos resolvendo

Evitar:

- `findByEmailAndCpfAndActiveAndCreatedAt...`
- Repositórios inchados
- Lógica de filtro espalhada

Queremos:

- Um **contrato único**
- Tipado
- Evolutivo
- Documentável

---

## 🧱 Definindo operadores de busca

```ts
/**
 * Operadores comuns de busca
 * Pode ser reutilizado por qualquer entidade
 */
export interface SearchOperators<T> {
  equals?: T;
  contains?: T;
  in?: T[];
  gt?: T;
  gte?: T;
  lt?: T;
  lte?: T;
}
```

---

## 🧠 Criteria genérico

```ts
/**
 * Criteria genérico baseado na entidade
 * Cada campo pode ter operadores
 */
export type SearchCriteria<T> = {
  [P in keyof T]?: SearchOperators<T[P]>;
};
```

📌 **Impacto estratégico**
Isso vira um **padrão de busca do projeto inteiro**.

---

## 🧪 Exemplo aplicado ao User

```ts
type UserSearchCriteria = SearchCriteria<User>;
```

Uso:

```ts
const criteria: UserSearchCriteria = {
  email: { equals: 'a@a.com' },
  active: { equals: true },
  createdAt: { gte: new Date('2024-01-01') }
};
```

---

# 2️⃣ BaseRepository com suporte a Criteria

```ts
export interface BaseRepository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  findByCriteria(criteria: SearchCriteria<T>): Promise<T[]>;
  create(entity: T): Promise<T>;
  update(entity: T): Promise<T>;
  delete(id: ID): Promise<void>;
  existsById(id: ID): Promise<boolean>;
}
```

📌 **SRP respeitado**
📌 **Sem acoplamento de domínio**

---

# 3️⃣ Implementação com Prisma (realista)

## 🧠 Contexto

- Prisma já trabalha muito bem com filtros
- Vamos **traduzir o Criteria → Prisma Where**

---

## 🔧 Adaptador de Criteria → Prisma

```ts
/**
 * Traduz SearchCriteria genérico para filtros do Prisma
 * Isola dependência do ORM (Clean Architecture)
 */
export class PrismaCriteriaMapper {
  static toWhere<T>(criteria: SearchCriteria<T>): any {
    const where: any = {};

    for (const field in criteria) {
      const operators = criteria[field];

      if (!operators) continue;

      where[field] = {
        ...(operators.equals !== undefined && { equals: operators.equals }),
        ...(operators.contains && { contains: operators.contains }),
        ...(operators.in && { in: operators.in }),
        ...(operators.gt && { gt: operators.gt }),
        ...(operators.gte && { gte: operators.gte }),
        ...(operators.lt && { lt: operators.lt }),
        ...(operators.lte && { lte: operators.lte })
      };
    }

    return where;
  }
}
```

📌 **Boa prática**: isso fica na camada **infra**, não no domínio.

---

## 🧱 UserRepository com Prisma

```ts
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findByCriteria(criteria: SearchCriteria<User>): Promise<User[]> {
    return this.prisma.user.findMany({
      where: PrismaCriteriaMapper.toWhere(criteria)
    });
  }

  async create(user: User): Promise<User> {
    return this.prisma.user.create({ data: user });
  }

  async update(user: User): Promise<User> {
    return this.prisma.user.update({
      where: { id: user.id },
      data: user
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { id } });
    return count > 0;
  }
}
```

---

# 4️⃣ Exemplos práticos de uso (muito importantes)

### 🔍 Buscar por email

```ts
userRepository.findByCriteria({
  email: { equals: 'a@a.com' }
});
```

---

### 🔍 Buscar usuários ativos criados após uma data

```ts
userRepository.findByCriteria({
  active: { equals: true },
  createdAt: { gte: new Date('2024-01-01') }
});
```

---

### 🔍 Buscar por múltiplos valores (IN)

```ts
userRepository.findByCriteria({
  id: { in: ['1', '2', '3'] }
});
```

---

# 5️⃣ Clean Architecture — onde cada coisa fica

```
src/
 ├── domain/
 │    ├── entities/
 │    ├── repositories/
 │    │    └── user-repository.ts
 │    └── value-objects/
 │
 ├── application/
 │    ├── use-cases/
 │    └── dtos/
 │
 ├── infra/
 │    ├── prisma/
 │    │    ├── prisma-client.ts
 │    │    ├── prisma-user-repository.ts
 │    │    └── prisma-criteria-mapper.ts
 │
 └── main/
      └── factories/
```

📌 **Dependência sempre aponta para dentro**

---

# 6️⃣ Erros comuns (atenção aqui)

❌ Criar Criteria dependente do Prisma
❌ Filtro em memória quando dá pra filtrar no banco
❌ Não documentar operadores disponíveis
❌ Não criar índices no banco
❌ Misturar regra de negócio com persistência

---

# 7️⃣ Complexidade (Big-O)

| Operação         | Complexidade | Observação               |
| ---------------- | ------------ | ------------------------ |
| equals / in      | O(1)         | Com índice               |
| range (gte, lte) | O(log n)     | Índice B-tree            |
| contains         | O(n)         | Evite em tabelas grandes |

---

# 8️⃣ Recomendações finais (experiência real)

### 📌 Técnicas

- Crie **índices** para todos os campos filtráveis
- Documente AND vs OR (Prisma usa AND por padrão)
- Separe **Criteria** de **DTO de API**

### 📌 Estratégicas

Esse padrão vira:

- Guideline de time
- Base de microserviços
- Redução drástica de código duplicado

---

Se quiser, no próximo passo posso:

- 🔥 Adicionar **paginação, ordenação e cursor**
- 🧪 Mostrar **testes unitários desse repositório**
- 🧩 Generalizar isso para **qualquer ORM**
- 📄 Transformar tudo isso em **documentação oficial de time**

Só me dizer qual você quer seguir 👌
