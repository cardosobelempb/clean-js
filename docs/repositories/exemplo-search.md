Ótima pergunta — esse é **exatamente o ponto onde muitos repositórios começam a degradar** se o design não for bem pensado.
Vou mostrar **formas corretas, escaláveis e reutilizáveis** de fazer busca por **um ou mais campos**, sempre justificando as decisões.

Vou dividir em **3 abordagens**, do **mais simples ao mais robusto**, como em um projeto real que evolui ao longo do tempo.

---

# 🧱 Contexto do domínio (exemplo)

Vamos assumir um domínio simples de **Usuário**:

```ts
interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  active: boolean;
  createdAt: Date;
}
```

---

# 🥇 Abordagem 1 — Métodos explícitos (simples e clara)

### Quando usar

- Poucos campos
- Regras bem definidas
- Alta previsibilidade
- Times júnior

### Interface

```ts
export interface UserRepository extends BaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByCpf(cpf: string): Promise<User | null>;
  findByEmailOrCpf(value: string): Promise<User | null>;
}
```

### Implementação (exemplo conceitual)

```ts
async findByEmailOrCpf(value: string): Promise<User | null> {
  return this.orm.user.findFirst({
    where: {
      OR: [
        { email: value },
        { cpf: value }
      ]
    }
  });
}
```

### ✅ Vantagens

- Muito legível
- Intenção clara
- Fácil de testar

### ❌ Desvantagens

- Cresce rápido demais
- Não escala bem com muitos campos

📌 **Erro comum**: sair criando `findByXAndYAndZ`.

---

# 🥈 Abordagem 2 — Busca por critérios (recomendada para médio porte)

Aqui começamos a pensar como **engenheiros de software**, não só coders.

---

## 🎯 Criando um objeto de critérios

```ts
export interface UserSearchCriteria {
  id?: string;
  email?: string;
  cpf?: string;
  active?: boolean;
  createdAfter?: Date;
}
```

### Interface do repositório

```ts
export interface UserRepository extends BaseRepository<User> {
  findByCriteria(criteria: UserSearchCriteria): Promise<User[]>;
}
```

---

## 🧠 Implementação (exemplo com ORM)

```ts
async findByCriteria(
  criteria: UserSearchCriteria
): Promise<User[]> {
  return this.orm.user.findMany({
    where: {
      ...(criteria.id && { id: criteria.id }),
      ...(criteria.email && { email: criteria.email }),
      ...(criteria.cpf && { cpf: criteria.cpf }),
      ...(criteria.active !== undefined && { active: criteria.active }),
      ...(criteria.createdAfter && {
        createdAt: { gte: criteria.createdAfter }
      }),
    }
  });
}
```

### 🧠 O que está acontecendo aqui?

- Cada campo é **opcional**
- O `spread` só adiciona o filtro se existir
- Não cria métodos infinitos

---

### ✅ Vantagens

- Escalável
- Fácil de evoluir
- Código limpo
- Ótimo para filtros combinados

### ❌ Desvantagens

- Um pouco mais complexo
- Precisa de documentação

📌 **Boa prática**: documentar o `Criteria` como contrato público.

---

# 🥉 Abordagem 3 — Specification Pattern (nível sênior)

Essa é a **mais poderosa** e a mais mal utilizada 😄

---

## 🎯 Interface de Specification

```ts
export interface Specification<T> {
  isSatisfiedBy(entity: T): boolean;
}
```

### Especificações de domínio

```ts
export class UserByEmailSpec implements Specification<User> {
  constructor(private readonly email: string) {}

  isSatisfiedBy(user: User): boolean {
    return user.email === this.email;
  }
}

export class ActiveUserSpec implements Specification<User> {
  isSatisfiedBy(user: User): boolean {
    return user.active;
  }
}
```

---

## 🧠 Uso no repositório

```ts
export interface UserRepository extends BaseRepository<User> {
  findBySpecification(specification: Specification<User>): Promise<User[]>;
}
```

### Implementação (conceito)

```ts
async findBySpecification(
  spec: Specification<User>
): Promise<User[]> {
  const users = await this.findAll();
  return users.filter(user => spec.isSatisfiedBy(user));
}
```

📌 _Em bancos reais, a specification vira query — não filtro em memória._

---

### ✅ Vantagens

- Domínio riquíssimo
- Altamente testável
- Regras reutilizáveis

### ❌ Desvantagens

- Overkill para sistemas pequenos
- Curva de aprendizado

---

# 🧪 Exemplos práticos de uso

### 🔍 Buscar por um campo

```ts
userRepository.findByCriteria({ email: 'a@a.com' });
```

### 🔍 Buscar por múltiplos campos

```ts
userRepository.findByCriteria({
  active: true,
  createdAfter: new Date('2024-01-01')
});
```

### 🔍 Buscar por email ou CPF

```ts
userRepository.findByCriteria({
  email: 'a@a.com',
  cpf: '12345678900'
});
```

_(depende se a implementação usa AND ou OR — documente isso!)_

---

# 📊 Complexidade (Big-O)

| Abordagem          | Complexidade | Observação           |
| ------------------ | ------------ | -------------------- |
| Métodos explícitos | O(1)         | Com índice           |
| Criteria           | O(1)–O(n)    | Depende do índice    |
| Specification      | O(n)         | Em memória (exemplo) |

---

# ❌ Erros comuns

- ❌ Criar métodos infinitos
- ❌ Colocar lógica de negócio no repositório
- ❌ Filtros em memória desnecessários
- ❌ Não documentar AND vs OR
- ❌ Não indexar campos

---

# 🧠 Recomendação final (experiência prática)

| Tamanho do sistema | Abordagem             |
| ------------------ | --------------------- |
| Pequeno            | Métodos explícitos    |
| Médio              | Criteria Object ⭐    |
| Grande / Complexo  | Specification Pattern |

Se quiser, no próximo passo posso:

- Implementar isso com **Prisma / TypeORM**
- Mostrar como isso entra em **Clean Architecture**
- Criar um **SearchCriteria genérico reutilizável**

É só dizer 🚀
