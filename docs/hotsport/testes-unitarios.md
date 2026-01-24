Perfeito — agora vamos ao **item 5: Exemplos de testes unitários** para os Use Cases que definimos, com **mocks das dependências** (repositórios e API client) usando **Jest** (setup mais comum em TypeScript). Isso é essencial para validar as regras de negócio em isolamento, como previsto em Clean Architecture.

✔️ Vamos usar **mocks manuais com `jest.fn()`** para simular dependências externas, conforme boas práticas que indicam testar _apenas a lógica do Use Case_, sem infraestrutura real envolvida (DB/API) ([Nanosoft][1]).

---

# 🧪 5. Testes Unitários para Use Cases (TypeScript + Jest)

---

## 📌 5.1 Configuração de Ambiente de Testes

No `package.json`:

```json
{
  "scripts": {
    "test": "jest --runInBand",
    "test:watch": "jest --watch"
  },
  "devDependencies": {
    "jest": "^29.x",
    "@types/jest": "^29.x",
    "ts-jest": "^29.x"
  }
}
```

E o arquivo `jest.config.js`:

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node'
};
```

Esse setup permite rodar testes em TypeScript puro com Jest usando mocks facilmente ([Documentação AWS][2]).

---

## 🧪 5.2 Teste do Use Case: **CreateHotspotUser**

### ✔ Objetivos do teste

✔ Confirmar que um usuário válido chama os métodos corretos
✔ Validar regras de negócio (username vazio, senha curta, perfil não existe, usuário duplicado)

---

### 🧪 Estrutura de teste

Arquivo:
`src/application/usecases/createHotspotUser/CreateHotspotUser.spec.ts`

```ts
import { CreateHotspotUser } from './CreateHotspotUser';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IProfileRepository } from '../../../domain/repositories/IProfileRepository';
import { IMikrotikApiClient } from '../../../domain/repositories/IMikrotikApiClient';

describe('CreateHotspotUser UseCase', () => {
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockProfileRepo: jest.Mocked<IProfileRepository>;
  let mockApiClient: jest.Mocked<IMikrotikApiClient>;
  let sut: CreateHotspotUser;

  beforeEach(() => {
    mockUserRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    } as any;

    mockProfileRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    } as any;

    mockApiClient = {
      addUser: jest.fn(),
      removeUser: jest.fn(),
      getUsers: jest.fn(),
      getProfiles: jest.fn(),
      addProfile: jest.fn(),
      removeProfile: jest.fn()
      // definir qualquer outro método da interface
    } as any;

    sut = new CreateHotspotUser(mockUserRepo, mockProfileRepo, mockApiClient);
  });

  it('should create user successfully when input is valid', async () => {
    mockProfileRepo.findById.mockResolvedValue({ id: 'p1' } as any);

    await sut.execute({
      username: 'user1',
      password: 'StrongPass123',
      profileId: 'p1'
    });

    expect(mockUserRepo.save).toHaveBeenCalled();
    expect(mockApiClient.addUser).toHaveBeenCalled();
  });

  it('should throw if username is empty', async () => {
    await expect(
      sut.execute({ username: '', password: 'pwd', profileId: 'p1' })
    ).rejects.toThrow('Username não pode ser vazio');
  });

  it('should throw if password is too short', async () => {
    await expect(
      sut.execute({ username: 'user1', password: '123', profileId: 'p1' })
    ).rejects.toThrow('Senha deve ter no mínimo 8 caracteres');
  });

  it('should throw if profile does not exist', async () => {
    mockProfileRepo.findById.mockResolvedValue(null);

    await expect(
      sut.execute({
        username: 'user1',
        password: 'StrongPass',
        profileId: 'p2'
      })
    ).rejects.toThrow('Perfil não encontrado');
  });

  it('should throw if user already exists', async () => {
    mockProfileRepo.findById.mockResolvedValue({ id: 'p1' } as any);
    mockUserRepo.findById.mockResolvedValue({ username: 'user1' } as any);

    await expect(
      sut.execute({
        username: 'user1',
        password: 'StrongPass',
        profileId: 'p1'
      })
    ).rejects.toThrow('Usuário já existe');
  });
});
```

📌 Nesse teste:

- usamos mocks para repositórios e API client
- cobrimos regras de negócio isoladamente
- o Use Case é testado sem acesso à API real ou DB
  ✔ Esse padrão de mocks com `jest.fn()` facilita afirmar comportamento interno e garantir execução correta do Use Case ([Nanosoft][1]).

---

## 🧪 5.3 Teste do Use Case: **GenerateVoucherBatch**

Arquivo:
`src/application/usecases/generateVoucherBatch/GenerateVoucherBatch.spec.ts`

```ts
import { GenerateVoucherBatch } from './GenerateVoucherBatch';
import { IVoucherRepository } from '../../../domain/repositories/IVoucherRepository';
import { IProfileRepository } from '../../../domain/repositories/IProfileRepository';
import { VoucherGenerator } from '../../../domain/services/VoucherGenerator';

describe('GenerateVoucherBatch UseCase', () => {
  let mockVoucherRepo: jest.Mocked<IVoucherRepository>;
  let mockProfileRepo: jest.Mocked<IProfileRepository>;
  let voucherGen: VoucherGenerator;
  let sut: GenerateVoucherBatch;

  beforeEach(() => {
    mockVoucherRepo = {
      createBatch: jest.fn(),
      findBatchById: jest.fn(),
      listBatches: jest.fn()
    } as any;

    mockProfileRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    } as any;

    voucherGen = new VoucherGenerator(6);
    sut = new GenerateVoucherBatch(
      mockVoucherRepo,
      mockProfileRepo,
      voucherGen
    );
  });

  it('should generate a voucher batch successfully', async () => {
    mockProfileRepo.findById.mockResolvedValue({ id: 'profile1' } as any);

    await sut.execute({ profileId: 'profile1', quantity: 3 });

    expect(mockVoucherRepo.createBatch).toHaveBeenCalledTimes(1);
  });

  it('should throw if quantity is < 1', async () => {
    await expect(
      sut.execute({ profileId: 'profile1', quantity: 0 })
    ).rejects.toThrow('Quantidade deve ser mínima 1');
  });

  it('should throw if profile is invalid', async () => {
    mockProfileRepo.findById.mockResolvedValue(null);

    await expect(
      sut.execute({ profileId: 'profile2', quantity: 3 })
    ).rejects.toThrow('Perfil inválido');
  });
});
```

---

## 🧠 Boas práticas de testes aplicadas

### ✅ AAA (Arrange, Act, Assert)

Separar claramente:

- **Arrange** — preparar mocks/propriedades
- **Act** — executar o método sob teste
- **Assert** — validar comportamento

Esse padrão torna o teste mais fácil de ler e manter. ([Gist][3])

---

## 🧠 Dicas avançadas

### 🧩 Mocks com Jest

Use `jest.fn()` e `jest.Mocked<>` para:

✔ controlar respostas do mock
✔ afirmar chamadas de métodos
✔ simular exceções ou retornos inesperados ([Nanosoft][1])

---

## 📊 Benefícios diretos desses testes

✔ Validam regras de negócio independentemente da infra
✔ Protegem refatorações futuras com segurança
✔ Permitem fácil integração com CI/CD
✔ Testes rápidos (sem API/DB real)

---

## 📌 Próximos passos opcionais

Posso também gerar:

👉 **Testes de integração** (em cima dos endpoints HTTP, integrando Use Cases)
👉 **Cobertura de testes** automatizada
👉 **Estratégias de mocks avançados** (por exemplo com _factory functions_ ou _test doubles_)

Se quiser um exemplo desses também (como mocks reusáveis / fixtures), posso gerar! 🚀

[1]: https://nanosoft.co.za/blog/post/clean-architecture-unit-testing?utm_source=chatgpt.com 'Clean Architecture: Unit Testing'
[2]: https://docs.aws.amazon.com/pt_br/prescriptive-guidance/latest/best-practices-cdk-typescript-iac/development-best-practices.html?utm_source=chatgpt.com 'Adote uma abordagem de desenvolvimento orientado por testes - AWS Orientação prescritiva'
[3]: https://gist.github.com/leobaiano/b7577f70a8c1b5fd6c73abfc816d6766?utm_source=chatgpt.com 'Prompt unit tests nodejs with typescript · GitHub'
