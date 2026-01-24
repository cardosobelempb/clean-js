Perfeito — com base nas funcionalidades principais do **Mikhmon (MikroTik Hotspot Monitor)** (por exemplo: criação/edição de usuários, perfis, vouchers, listagem e histórico de sessions) e no domínio de arquitetura limpa, agora vamos estruturar **interfaces de repositório (ports)** para cada entidade do domínio, com foco em **regras de negócio, injeção de dependência e desacoplamento**. ([GitHub][1])

---

# ⚙️ 2. Interfaces de _Repositories_ e Portas (Ports) para cada entidade

> **Objetivo:** definir contratos que representam operações permitidas por cada entidade, isolando o domínio da infraestrutura (DB, API, cache, etc.).
> Esses contratos existem dentro da camada **Application / Domain** e não têm dependências externas.

---

## 📌 Estrutura de Pastas Sugerida (Clean Architecture)

```
src/
├── domain/
│   ├── entities/
│   │   ├── HotspotUser.ts
│   │   ├── Profile.ts
│   │   ├── VoucherBatch.ts
│   │   ├── ActiveSession.ts
│   │   ├── Report.ts
│   │   └── RouterConfig.ts
│   └── repositories/
│       ├── IUserRepository.ts
│       ├── IProfileRepository.ts
│       ├── IVoucherRepository.ts
│       ├── ISessionRepository.ts
│       └── IReportRepository.ts
├── application/
│   ├── usecases/
│   └── dto/
├── infrastructure/
│   ├── api/
│   ├── db/
│   ├── cache/
│   └── adapters/
└── presentation/
    └── controllers/
```

---

## 📌 💡 Boas práticas aplicadas

✔ **Regras de negócio primeiro** — interfaces definem apenas operação esperada pelo domínio
✔ **Desacoplamento total** — nada relacionado à API do MikroTik ou DB específico aqui
✔ **Nome semântico** — métodos explicam _o que fazem_, não _como fazem_
✔ **Retorno claro para tratar resultados** (tipos ou exceptions)
✔ **Facilidade de testes** — mocks podem substituir facilmente implementações
✔ **Open for extension, closed for modification** ~ SOLID

---

## 🧩 Interface `IUserRepository`

Responsável por abstrair operações de usuários Hotspot.

```ts
/**
 * Port — abstração para operações de usuário Hotspot
 */
export interface IUserRepository {
  /**
   * Busca um usuário pelo identificador
   * @param id - Identificador único
   * @returns HotspotUser ou null se não existir
   */
  findById(id: string): Promise<HotspotUser | null>;

  /**
   * Lista todos os usuários cadastrados
   */
  findAll(): Promise<HotspotUser[]>;

  /**
   * Persiste um novo usuário
   * @throws ValidationError se violar regras
   */
  save(user: HotspotUser): Promise<void>;

  /**
   * Remove um usuário pelo identificador
   */
  delete(id: string): Promise<void>;
}
```

📌 _Exemplos de onde isso é usado:_ UseCases que criam/atualizam usuários hotspot. ([GitHub][1])

---

## 🧩 Interface `IProfileRepository`

Focado em perfis de serviço (regras de velocidade, validade).

```ts
export interface IProfileRepository {
  findById(id: string): Promise<Profile | null>;
  findAll(): Promise<Profile[]>;
  save(profile: Profile): Promise<void>;
  delete(id: string): Promise<void>;
}
```

📌 _Regras importantes:_ perfis com mesmo nome devem ser impedidos; velocidade mínima/máxima verificada no nível do domínio. ([GitHub][1])

---

## 🧩 Interface `IVoucherRepository`

Gerenciamento de vouchers ou lotes.

```ts
export interface IVoucherRepository {
  /**
   * Cria um lote de vouchers
   */
  createBatch(voucherBatch: VoucherBatch): Promise<void>;

  /**
   * Busca lote pelo id
   */
  findBatchById(id: string): Promise<VoucherBatch | null>;

  /**
   * Lista todos lotes de voucher gerados
   */
  listBatches(): Promise<VoucherBatch[]>;
}
```

📌 _Regra:_ cada voucher num lote deve ser único; validade definida pelo perfil. ([GitHub][1])

---

## 🧩 Interface `ISessionRepository`

Obtém sessões ativas (usado para relatórios e monitoramento).

```ts
export interface ISessionRepository {
  listActive(): Promise<ActiveSession[]>;
  findByUsername(username: string): Promise<ActiveSession | null>;
}
```

📌 _Uso principal:_ dashboards e relatórios em tempo real. ([GitHub][1])

---

## 🧩 Interface `IReportRepository`

Abstração para geração de relatórios agregados.

```ts
export interface IReportRepository {
  generateDaily(): Promise<Report>;
  generateMonthly(): Promise<Report>;
}
```

📌 Relatórios são agregados derivados — podem ser implementados usando dados de sessões, usuários e métricas de uso. ([GitHub][1])

---

## 🧩 Interface `IMikrotikApiClient`

Essencial para comunicação com o _API RouterOS_ do MikroTik.

```ts
export interface IMikrotikApiClient {
  // Hotspot users
  getUsers(): Promise<HotspotUserDTO[]>;
  addUser(user: HotspotUserDTO): Promise<void>;
  updateUser(user: HotspotUserDTO): Promise<void>;
  removeUser(username: string): Promise<void>;

  // Profiles
  getProfiles(): Promise<ProfileDTO[]>;
  addProfile(profile: ProfileDTO): Promise<void>;
  removeProfile(name: string): Promise<void>;

  // Sessions
  getActiveSessions(): Promise<ActiveSessionDTO[]>;
}
```

⚠ Essa interface atua como **driver adapter** para o _RouterOS API_, isolando a camada de uso do protocolo ou SDK específicos.

---

## 📌 Por que separar _Repository_ e _API Client_?

Essa separação cumpre princípios de arquitetura limpa:

- **Repository abstrai entidades e regras de negócio**
- **API Client representa uma fonte de dados externa (RouterOS)**
- Permite combinar fontes (cache, DB local, API RouterOS)
- Facilita testes com mocks ou stubs

---

## 🧠 Exemplo de injeção de dependência (TypeScript)

```ts
class CreateHotspotUserUseCase {
  constructor(
    private userRepo: IUserRepository,
    private mikrotikApi: IMikrotikApiClient
  ) {}

  async execute(input: CreateHotspotUserInput): Promise<void> {
    // Validaçẽos do domínio
    const exists = await this.userRepo.findById(input.id);
    if (exists) throw new Error('User already exists');

    // Persistir local
    await this.userRepo.save(new HotspotUser(input));

    // Persistir no MikroTik
    await this.mikrotikApi.addUser(input.toDTO());
  }
}
```

📌 Essa organização garante:

- Sem dependência de framework
- Fácil mock para testes
- Regras de negócio no domínio
- Infra via adaptadores

---

## 🧠 Próximos Passos

Posso continuar com:

✔ **3. Implementação concreta das interfaces (ex.: MikroTik API + tests)**
✔ **4. Casos de uso (UseCases) completos com validações e erros coerentes**
✔ **5. Exemplos de testes unitários e de integração**

Qual próximo item você quer detalhar? (3 / 4 / 5) 🚀

[1]: https://github.com/laksa19/mikrotik-hotspot-monitor?utm_source=chatgpt.com 'GitHub - laksa19/mikrotik-hotspot-monitor: Mikrotik Hotspot Monitor adalah aplikasi berbasis web untuk menggantikan User Manager yang tidak didukung dibeberapa tipe RB Mikrotik.(bukan radius server)'
