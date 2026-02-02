## 3️⃣ Repository Específico (Extensão Controlada)

### `UserRepository.ts`

```ts
import { BaseRepository } from './BaseRepository';
import { User } from '../../domain/entities/User';

export class UserRepository extends BaseRepository<User> {
  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findUnique({
      where: { email }
    });
  }
}
```

### 💡 Boa prática

- **Somente queries específicas**
- Nada de CRUD duplicado
- Mantém SRP

---
