## 4️⃣ Métodos Reutilizáveis MAIS AVANÇADOS

### 🔹 Paginação padrão

```ts
async findPaginated(
  page: number,
  limit: number
): Promise<{ data: T[]; total: number }> {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.repository.findMany({ skip, take: limit }),
    this.repository.count()
  ]);

  return { data, total };
}
```

🧠 **Complexidade**

- `O(n)` para leitura
- `O(1)` para count (indexado)

---

### 🔹 Soft Delete (reutilizável)

```ts
async softDelete(id: string): Promise<void> {
  await this.repository.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
}
```

✔ Evita perda de dados
✔ Facilita auditoria

---

### 🔹 Upsert genérico

```ts
async upsert(entity: T & { id: string }): Promise<T> {
  return this.repository.upsert({
    where: { id: entity.id },
    update: entity,
    create: entity
  });
}
```
