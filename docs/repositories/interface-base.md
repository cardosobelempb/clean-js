## 1️⃣ Interface Base (Contrato do Domínio)

### `IBaseRepository.ts`

```ts
/**
 * Contrato base para qualquer repositório
 * Define apenas o que o domínio precisa saber
 */
/**
 * Repositório base genérico.
 * Responsável apenas por operações fundamentais de persistência.
 */
export interface BaseRepository<T, ID = string> {
  /**
   * Busca uma entidade pelo identificador único
   */
  findById(id: ID): Promise<T | null>;

  /**
   * Retorna todas as entidades
   */
  findAll(): Promise<T[]>;

  /**
   * Persiste uma nova entidade
   */
  create(entity: T): Promise<T>;

  /**
   * Atualiza uma entidade existente
   */
  update(entity: T): Promise<T>;

  /**
   * Remove uma entidade pelo ID
   */
  delete(id: ID): Promise<void>;

  /**
   * Verifica se uma entidade existe pelo ID
   */
  existsById(id: ID): Promise<boolean>;
}
```

## 🧩 2️⃣ Repositórios específicos por domínio (boa prática)

- Agora, para entidades que têm CPF e Email, criamos uma interface especializada.
- Exemplo: Usuário

```ts
/**
 * Repositório específico para regras de persistência de usuários
 */
export interface UserRepository extends BaseRepository<User> {
  /**
   * Verifica se já existe um usuário com o CPF informado
   */
  existsByCpf(cpf: string): Promise<boolean>;

  /**
   * Verifica se já existe um usuário com o email informado
   */
  existsByEmail(email: string): Promise<boolean>;
}
```

## 🧠 Exemplo prático de uso

```ts
async function registerUser(userRepository: UserRepository, user: User) {
  if (await userRepository.existsByCpf(user.cpf)) {
    throw new Error('CPF já cadastrado');
  }

  if (await userRepository.existsByEmail(user.email)) {
    throw new Error('Email já cadastrado');
  }

  return userRepository.create(user);
}
```

### 💡 Por que assim?

- **DIP (SOLID)** → domínio depende de abstração
- Facilita mocks em testes
- Evita acoplamento com ORM

---
