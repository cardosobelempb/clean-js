## 2️⃣ Implementação Base Reutilizável (Infra)

### `BaseRepository.ts`

```ts
/**
 * Implementação genérica de um repositório
 * Responsável APENAS por persistência
 */
export abstract class BaseRepository<T> {
  protected constructor(
    protected readonly repository: {
      findUnique: Function;
      findMany: Function;
      create: Function;
      update: Function;
      delete: Function;
      count: Function;
    }
  ) {}

  async findById(id: string): Promise<T | null> {
    return this.repository.findUnique({ where: { id } });
  }

  async findAll(): Promise<T[]> {
    return this.repository.findMany();
  }

  async create(entity: T): Promise<T> {
    return this.repository.create({ data: entity });
  }

  async update(entity: T & { id: string }): Promise<T> {
    return this.repository.update({
      where: { id: entity.id },
      data: entity
    });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }
}
```

### 🔍 Erros comuns aqui

❌ Colocar regra de negócio
❌ Tratar validação de domínio
❌ Retornar DTO em vez de entidade
❌ Misturar transação com lógica

---
