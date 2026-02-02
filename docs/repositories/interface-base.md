## 1️⃣ Interface Base (Contrato do Domínio)

### `IBaseRepository.ts`

```ts
/**
 * Contrato base para qualquer repositório
 * Define apenas o que o domínio precisa saber
 */
export interface IBaseRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: T): Promise<T>;
  update(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
```

### 💡 Por que assim?

- **DIP (SOLID)** → domínio depende de abstração
- Facilita mocks em testes
- Evita acoplamento com ORM

---
