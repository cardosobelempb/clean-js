Perfeito — antes de continuar com **o próximo item (Use Cases completos)**, um ponto importante para fundamentar as regras de negócio é entender claramente as **funcionalidades reais do Mikhmon**, conforme a aplicação de gestão de Hotspot MikroTik, porque isso molda os _use cases_ e as validações que cada um deve conter.

### 📌 Funcionalidades principais do Mikhmon

De acordo com a descrição oficial do projeto (e de forks similares) os principais recursos são:
🔹 Adicionar, editar e remover usuários Hotspot
🔹 Gerar e imprimir vouchers
🔹 Adicionar, editar e remover perfis de usuário
🔹 Dashboard com usuários ativos e relatórios
🔹 Suporte a múltiplos roteadores
🔹 Exportar relatórios e vouchers em formatos como PDF/CSV
🔹 Templates customizáveis para vouchers e páginas de login
📌 Esses recursos são típicos em Mikhmon clássico (PHP + API MikroTik). ([GitHub][1])

---

# 📌 4. Implementação de _Use Cases_ (Casos de Uso)

Nesta etapa vamos modelar **Use Cases completos em TypeScript** para a arquitetura proposta, com:

✅ Regras de negócio explícitas
✅ DTOs claros de entrada e saída
✅ Tratamento de erros adequado
✅ Responsabilidades bem separadas
✅ Facilidade de testes automatizados

---

## 🧠 Organização dos Use Cases

Cada use case encapsula **uma ação de negócio**.
Eles ficam na camada _application_, separados dos _adapters_ e _domínio_.

Estrutura sugerida:

```
src/application/usecases/
  createHotspotUser/
    CreateHotspotUser.ts
    CreateHotspotUserDTO.ts
  listHotspotUsers/
    ListHotspotUsers.ts
    ListHotspotUsersDTO.ts
  updateHotspotUser/
  deleteHotspotUser/
  generateVoucherBatch/
  listActiveSessions/
  listProfiles/
  createProfile/
  updateProfile/
  deleteProfile/
  fetchReports/
```

---

## 📦 4.1 Use Case — Criar Usuário Hotspot

### 🧠 Regras de negócio

✔ `username` único por roteador
✔ `password` adequado (mínimo de X caracteres)
✔ Perfil válido associado ao usuário
✔ Chamadas de persistência e API separadas

---

### ✍️ DTO de entrada (`CreateHotspotUserDTO.ts`)

```ts
export interface CreateHotspotUserDTO {
  username: string;
  password: string;
  profileId: string;
}
```

---

### ✍️ Use Case (`CreateHotspotUser.ts`)

```ts
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IProfileRepository } from '../../domain/repositories/IProfileRepository';
import { IMikrotikApiClient } from '../../domain/repositories/IMikrotikApiClient';
import { HotspotUser } from '../../domain/entities/HotspotUser';

/**
 * Use case: criar novo usuário hotspot
 */
export class CreateHotspotUser {
  constructor(
    private userRepo: IUserRepository,
    private profileRepo: IProfileRepository,
    private apiClient: IMikrotikApiClient
  ) {}

  async execute(input: CreateHotspotUserDTO): Promise<void> {
    // Regra: nome de usuário não pode estar vazio
    if (!input.username.trim()) {
      throw new Error('Username não pode ser vazio');
    }

    // Regra: senha mínima de 8 caracteres
    if (input.password.length < 8) {
      throw new Error('Senha deve ter no mínimo 8 caracteres');
    }

    // Regra: perfil associado deve existir
    const profile = await this.profileRepo.findById(input.profileId);
    if (!profile) {
      throw new Error('Perfil não encontrado');
    }

    // Regra: usuário único
    const existing = await this.userRepo.findById(input.username);
    if (existing) {
      throw new Error('Usuário já existe');
    }

    // Criar entidade no domínio
    const user = new HotspotUser({
      username: input.username,
      password: input.password,
      profileId: input.profileId,
      isActive: true
    });

    // Persistir local (se houver DB)
    await this.userRepo.save(user);

    // Persistir via API MikroTik
    await this.apiClient.addUser({
      username: user.username,
      password: user.password,
      profile: user.profileId,
      disabled: !user.isActive
    });
  }
}
```

---

## 📦 4.2 Use Case — Listar Usuários Hotspot

### 📌 Objetivo

Retornar todos os usuários cadastrados via API e/ou repositório local.

---

### ✍️ DTO de saída (`ListHotspotUsersDTO.ts`)

```ts
import { HotspotUser } from '../../domain/entities/HotspotUser';

export interface ListHotspotUsersResult {
  users: HotspotUser[];
}
```

---

### ✍️ Use Case (`ListHotspotUsers.ts`)

```ts
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ListHotspotUsersResult } from './ListHotspotUsersDTO';

/**
 * Use case: listar todos usuários hotspot
 */
export class ListHotspotUsers {
  constructor(private userRepo: IUserRepository) {}

  async execute(): Promise<ListHotspotUsersResult> {
    const users = await this.userRepo.findAll();
    return { users };
  }
}
```

---

## 📦 4.3 Use Case — Gerar Lote de Vouchers

### 🧠 Regras de negócio

✔ Quantidade maior que 0
✔ Códigos únicos
✔ Perfil válido

---

### ✍️ DTO de entrada (`GenerateVoucherBatchDTO.ts`)

```ts
export interface GenerateVoucherBatchDTO {
  profileId: string;
  quantity: number;
}
```

---

### ✍️ Use Case (`GenerateVoucherBatch.ts`)

```ts
import { IVoucherRepository } from '../../domain/repositories/IVoucherRepository';
import { IProfileRepository } from '../../domain/repositories/IProfileRepository';
import { VoucherGenerator } from '../../domain/services/VoucherGenerator';

export class GenerateVoucherBatch {
  constructor(
    private voucherRepo: IVoucherRepository,
    private profileRepo: IProfileRepository,
    private voucherGen: VoucherGenerator
  ) {}

  async execute(input: GenerateVoucherBatchDTO): Promise<void> {
    const { profileId, quantity } = input;

    if (quantity < 1) {
      throw new Error('Quantidade deve ser mínima 1');
    }

    const profile = await this.profileRepo.findById(profileId);
    if (!profile) {
      throw new Error('Perfil inválido');
    }

    const codes = this.voucherGen.generateBatch(quantity);
    await this.voucherRepo.createBatch({
      profileId,
      generatedCodes: codes,
      createdAt: new Date()
    });
  }
}
```

---

## 📦 4.4 Use Case — Listar Sessões Ativas

### ✍️ DTO de saída (`ListActiveSessionsResult.ts`)

```ts
import { ActiveSession } from '../../domain/entities/ActiveSession';

export interface ListActiveSessionsResult {
  sessions: ActiveSession[];
}
```

---

### ✍️ Use Case (`ListActiveSessions.ts`)

```ts
import { ISessionRepository } from '../../domain/repositories/ISessionRepository';
import { ListActiveSessionsResult } from './ListActiveSessionsResult';

export class ListActiveSessions {
  constructor(private sessionRepo: ISessionRepository) {}

  async execute(): Promise<ListActiveSessionsResult> {
    const sessions = await this.sessionRepo.listActive();
    return { sessions };
  }
}
```

---

## 🧠 Boas práticas aplicadas nos Use Cases

✔ **SRP** — cada caso faz apenas uma operação de negócio
✔ **Tratamento claro de erros** — entradas inválidas já são validadas
✔ **Independência de infraestrutura** — regras não dependem de HTTP, DB ou API específicos
✔ **Facilmente testáveis com mocks** no repositório e API client
✔ **DTOs** separam o que é entrada/saída da lógica
✔ **Alta reutilização** — estrutura padrão que pode ser replicada para qualquer Use Case

---

## 📝 Resumo dos Use Cases Implementados

| Use Case             | Validações Principais                                          | Dependências                                             |
| -------------------- | -------------------------------------------------------------- | -------------------------------------------------------- |
| CreateHotspotUser    | Username não vazio, senha mínima, perfil existe, usuário único | IUserRepository, IProfileRepository, IMikrotikApiClient  |
| ListHotspotUsers     | ---                                                            | IUserRepository                                          |
| GenerateVoucherBatch | Quantidade ≥1, perfil existe, código único                     | IProfileRepository, IVoucherRepository, VoucherGenerator |
| ListActiveSessions   | ---                                                            | ISessionRepository                                       |

💡 Com essa estrutura, cada caso é auto-contido, testável e respeita o modelo de Clean Architecture — e também lida com regras observadas nas ferramentas Mikhmon reais (gerar vouchers, gerenciar usuários e perfis, relatórios e sessões). ([GitHub][1])

---

## 🧠 Próximos passos que posso detalhar

👉 **5. Exemplos de testes unitários** (com mocks dos repositórios e API client)
👉 **6. API HTTP (Express / Fastify)** com controllers seguindo esses Use Cases
👉 **7. Documentação auto-gerada (OpenAPI/Swagger)**

Qual desses você quer a seguir? 🚀

[1]: https://github.com/marketplace/dailylepedia?utm_source=chatgpt.com 'MIKHMON V3 · GitHub Marketplace · GitHub'
