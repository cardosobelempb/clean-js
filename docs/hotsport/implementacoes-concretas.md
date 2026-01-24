Perfeito! Agora vamos avançar com o **item 3: Implementação concreta das interfaces (ports) na prática**, seguindo os princípios de **Clean Architecture**, com foco em **regras de negócio, desacoplamento e testabilidade**.

Vamos criar **implementações reais** para os _repos_ e _API client_, com exemplos de como devem se comportar, incluindo validações relevantes e contratação de contratos.

Os exemplos são em **TypeScript**, organizados em camadas e com explicações passo a passo, conforme suas diretrizes.

---

## 📌 Resumo do que o Mikhmon realmente faz

Antes de iniciar as implementações, vale lembrar os principais recursos mapeados na ferramenta original:

➡️ Mikhmon é uma aplicação web que **gera e gerencia usuários hotspot, perfis, vouchers e relatórios** por meio da **API RouterOS do Mikrotik** (porta 8728 da API ou via REST nas versões mais novas). ([GitHub][1])

---

# 🧱 3. Implementações Concretas

Em Clean Architecture, toda implementação concreta fica sob a camada de **Infraestrutura** (Adapters). Vamos percorrer:

1. **Implementação de um API Client para MikroTik**
2. **Implementação de Repositórios concretos**
3. **Implementação de Serviços auxiliares (ex.: Gerador de Voucher)**

---

## 🧩 3.1. 🛠️ **Adapter: MikroTik API Client**

Esse cliente encapsula comunicação com a API do RouterOS para hotspots, perfis, sessões ativas etc.

### ✍️ Estrutura esperada

Pasta:

```
src/infrastructure/adapters/mikrotik
├── MikrotikApiClient.ts
├── dto/
│   ├── HotspotUserDTO.ts
│   └── ProfileDTO.ts
```

---

### 📌 DTOs (Data Transfer Objects)

DTOs representam a forma de dados que sairá/entrará da API do RouterOS.

#### dto/HotspotUserDTO.ts

```ts
export interface HotspotUserDTO {
  username: string;
  password?: string;
  profile: string;
  disabled: boolean;
}
```

---

#### dto/ProfileDTO.ts

```ts
export interface ProfileDTO {
  name: string;
  uploadRate: string;
  downloadRate: string;
  validity: string;
}
```

---

## 🧠 MikrotikApiClient

Esse adapter usa um cliente (HTTP ou TCP) específico para conversar com o MikroTik RouterOS.

> OBS: RouterOS pode ter API binária ou REST nativa em versões recentes — aqui vamos supor abstração que possa suportar ambos.

---

```ts
import { HotspotUserDTO, ProfileDTO } from './dto';

/**
 * Implementação concreta de comunicação com a API do MikroTik.
 * Interface não depende de infraestrutura — mas essa classe concreta sim,
 * aqui usamos axios ou outro cliente HTTP/Text API.
 */
export class MikrotikApiClient {
  constructor(
    private baseUrl: string,
    private apiToken: string
  ) {}

  async getUsers(): Promise<HotspotUserDTO[]> {
    const response = await fetch(`${this.baseUrl}/hotspot/users`, {
      headers: { Authorization: `Bearer ${this.apiToken}` }
    });
    return response.json();
  }

  async addUser(user: HotspotUserDTO): Promise<void> {
    await fetch(`${this.baseUrl}/hotspot/users`, {
      method: 'POST',
      body: JSON.stringify(user),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiToken}`
      }
    });
  }

  async removeUser(username: string): Promise<void> {
    await fetch(`${this.baseUrl}/hotspot/users/${username}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.apiToken}` }
    });
  }

  async getProfiles(): Promise<ProfileDTO[]> {
    const response = await fetch(`${this.baseUrl}/profiles`, {
      headers: { Authorization: `Bearer ${this.apiToken}` }
    });
    return response.json();
  }

  async addProfile(profile: ProfileDTO): Promise<void> {
    await fetch(`${this.baseUrl}/profiles`, {
      method: 'POST',
      body: JSON.stringify(profile),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiToken}`
      }
    });
  }

  async removeProfile(name: string): Promise<void> {
    await fetch(`${this.baseUrl}/profiles/${name}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.apiToken}` }
    });
  }
}
```

---

### 🧠 Por que essa separação é importante

✔ Isola o protocolo (HTTP/RouterOS API REST) da lógica de aplicação
✔ Permite testar _UseCases_ com mocks
✔ Facilita troca por outras implementações laterais (ex.: SSH, binário API, etc.)

---

## 🧩 3.2. 🧾 Implementação de Repositórios Concretos

Repositórios concretos fazem a ponte entre Domain Repos _contracts_ e a infraestrutura.

Exemplo: `UserRepository` usando o `MikrotikApiClient`.

---

### 🟢 src/infrastructure/repositories/MikrotikUserRepository.ts

```ts
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { HotspotUser } from '../../domain/entities/HotspotUser';
import { MikrotikApiClient } from '../adapters/mikrotik/MikrotikApiClient';

/**
 * Implementação concreta do repositório para usuários de hotspot
 * utilizando a API do MikroTik.
 */
export class MikrotikUserRepository implements IUserRepository {
  constructor(private client: MikrotikApiClient) {}

  async findById(id: string): Promise<HotspotUser | null> {
    const users = await this.client.getUsers();
    const userDto = users.find(u => u.username === id);
    if (!userDto) return null;

    return new HotspotUser({
      username: userDto.username,
      password: userDto.password ?? '',
      profileId: userDto.profile,
      isActive: !userDto.disabled
    });
  }

  async findAll(): Promise<HotspotUser[]> {
    const users = await this.client.getUsers();
    return users.map(
      u =>
        new HotspotUser({
          username: u.username,
          password: u.password ?? '',
          profileId: u.profile,
          isActive: !u.disabled
        })
    );
  }

  async save(user: HotspotUser): Promise<void> {
    await this.client.addUser({
      username: user.username,
      password: user.password,
      profile: user.profileId,
      disabled: !user.isActive
    });
  }

  async delete(id: string): Promise<void> {
    await this.client.removeUser(id);
  }
}
```

---

### 🟦 src/infrastructure/repositories/MikrotikProfileRepository.ts

```ts
import { IProfileRepository } from '../../domain/repositories/IProfileRepository';
import { Profile } from '../../domain/entities/Profile';
import { MikrotikApiClient } from '../adapters/mikrotik/MikrotikApiClient';

/**
 * Repositório de Profiles via MikroTik API
 */
export class MikrotikProfileRepository implements IProfileRepository {
  constructor(private client: MikrotikApiClient) {}

  async findById(id: string): Promise<Profile | null> {
    const profiles = await this.client.getProfiles();
    const dto = profiles.find(p => p.name === id);
    if (!dto) return null;
    return new Profile({
      id: dto.name,
      bandwidthUp: parseInt(dto.uploadRate),
      bandwidthDown: parseInt(dto.downloadRate),
      validity: dto.validity
    });
  }

  async findAll(): Promise<Profile[]> {
    const profiles = await this.client.getProfiles();
    return profiles.map(
      p =>
        new Profile({
          id: p.name,
          bandwidthUp: parseInt(p.uploadRate),
          bandwidthDown: parseInt(p.downloadRate),
          validity: p.validity
        })
    );
  }

  async save(profile: Profile): Promise<void> {
    await this.client.addProfile({
      name: profile.id,
      uploadRate: `${profile.bandwidthUp}`,
      downloadRate: `${profile.bandwidthDown}`,
      validity: profile.validity
    });
  }

  async delete(id: string): Promise<void> {
    await this.client.removeProfile(id);
  }
}
```

---

## 🧠 3.3. Serviços auxiliares (Voucher Generator)

Voucher é um caso de uso especial que tipicamente precisa gerar múltiplos códigos e validar unicidade.

---

### 📜 VoucherGenerator.ts

```ts
export class VoucherGenerator {
  constructor(private length: number = 8) {}

  generate(): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < this.length; i++) {
      code += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return code;
  }

  /**
   * Gera num lote
   */
  generateBatch(quantity: number): string[] {
    const codes: Set<string> = new Set();
    while (codes.size < quantity) {
      codes.add(this.generate());
    }
    return Array.from(codes);
  }
}
```

---

## 🧠 Validação de Regras de Negócio

Boa prática: regras de negócio **sempre acontecem na camada de UseCase/domain**, não no adapter.

Exemplo: evitar usernames duplicados em um lote — isso é feito antes de chamar o repositório.

---

### 📌 Exemplo de UseCase que usa essas classes

```ts
class CreateVoucherBatch {
  constructor(
    private voucherRepo: IVoucherRepository,
    private voucherGen: VoucherGenerator
  ) {}

  async execute(profileId: string, quantity: number): Promise<void> {
    // regra: quantidade deve ser >= 1
    if (quantity < 1) throw new Error('Quantidade inválida');

    const codes = this.voucherGen.generateBatch(quantity);
    await this.voucherRepo.createBatch({ profileId, generatedCodes: codes });
  }
}
```

---

## 📌 Boas práticas aplicadas aqui

✔ Repositório é **contráto de porta (port)**. Ele não sabe _como_ a API funciona, apenas _o que_ deve fazer

✔ `Adapter` implementa portas — fácil de mockar
✔ Separação de DTO vs Entities
✔ Isolamento da API externa
✔ Facilita testes unitários e mocks

---

## 🚀 Benefícios inmediatos

✔ Permite **mockar API** em testes
✔ Facilita implementação de **cache, fallback ou pooling**
✔ Organiza código em módulos claros
✔ Padroniza integração com **MikroTik API** (abstrata)

---

## 🔜 Próximos itens que posso detalhar

➡ Testes unitários com mocks
➡ Derivação de casos de uso completos
➡ API HTTP (Express / Fastify) com controllers respeitando a Clean Architecture
➡ Plano de métricas e observabilidade

---

Se quiser, posso seguir com o **item 4: implementação completa de Use Cases** (a lógica de execução de cada caso na arquitetura limpa), incluindo tratamento de erros, DTOs de entrada/saída e testes 👨‍💻🚀

[1]: https://github.com/marketplace/dailylepedia?utm_source=chatgpt.com 'MIKHMON V3 · GitHub Marketplace · GitHub'
