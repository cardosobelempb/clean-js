Claro! Vamos gerar **exemplos práticos adicionais de testes — focados especialmente em mocks reusáveis e _test fixtures_**, para fortalecer a base de testes da sua arquitetura limpa em TypeScript. 💪

Esses padrões avançados ajudam a:

✅ Reduzir duplicação de código de teste
✅ Facilitar manutenção de suítes de testes grandes
✅ Criar _test doubles_ reutilizáveis
✅ Melhorar clareza sem misturar lógica de infraestrutura

Tudo isso com base na estrutura que já criamos para **Use Cases**, repositórios e adaptadores.

---

# 🧪 Estruturas Avançadas de Mocks e Fixtures em Jest

👉 Esses exemplos assumem que você já tem os testes unitários básicos para cada Use Case (como vimos no item 5), e agora quer **padronizar os mocks e fixtures** de forma elegante e escalável.

---

## 🎯 5.A Reutilizando Mocks com _Factory Functions_

Um padrão robusto para testes é usar _factory functions_ para criar mocks padronizados.

### 🧠 Benefícios

✔ Evita repetição de `jest.fn()` em cada teste
✔ Permite centralizar alteração de comportamento de mocks
✔ Facilita configuração de diferentes cenários (_happy path_, erros, etc.)

---

## 🧩 Exemplo: _Factory_ para `IUserRepository`

Crie um arquivo de fábrica, por exemplo:

```
tests/factories/userRepositoryMock.ts
```

```ts
import { IUserRepository } from '../../src/domain/repositories/IUserRepository';
import { HotspotUser } from '../../src/domain/entities/HotspotUser';

export const makeUserRepositoryMock = (): jest.Mocked<IUserRepository> => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  delete: jest.fn()

  // opcional: métodos adicionais simulados podem ser adicionados aqui
});
```

📌 Agora ao invés de repetir a declaração dos mocks em cada teste você pode simplesmente chamar:

```ts
import { makeUserRepositoryMock } from '../../tests/factories/userRepositoryMock';

const mockUserRepo = makeUserRepositoryMock();
```

---

## 🧩 5.B Com _Factory Functions_ para múltiplos repositórios

Da mesma forma, criamos _factories_ para cada interface:

```
tests/factories/profileRepositoryMock.ts
tests/factories/voucherRepositoryMock.ts
tests/factories/sessionRepositoryMock.ts
```

> Isso ajuda quando você precisa testar **cenários complexos envolvendo múltiplas dependências juntas**.

---

## 🧪 5.C Exemplo de Fixture: Usuário Válido

Para tornar os testes ainda mais claros, podemos definir _fixtures_ (dados de teste reutilizáveis).

Arquivo:

```
tests/fixtures/hotspotUser.ts
```

```ts
import { HotspotUser } from '../../src/domain/entities/HotspotUser';

export const validHotspotUser = new HotspotUser({
  username: 'validUser',
  password: 'StrongPassword123',
  profileId: 'profile1',
  isActive: true
});
```

Assim você não precisa repetir a definição de um usuário válido em todos os testes.

---

## 🧪 5.D Usando _Factories_ + Fixtures no Teste

Vamos reescrever um dos testes do _CreateHotspotUser_ usando os padrões acima:

```ts
import { CreateHotspotUser } from './CreateHotspotUser';
import { makeUserRepositoryMock } from '../../../tests/factories/userRepositoryMock';
import { makeProfileRepositoryMock } from '../../../tests/factories/profileRepositoryMock';
import { makeApiClientMock } from '../../../tests/factories/apiClientMock';
import { validHotspotUser } from '../../../tests/fixtures/hotspotUser';

describe('CreateHotspotUser (com factories e fixtures)', () => {
  let mockUserRepo = makeUserRepositoryMock();
  let mockProfileRepo = makeProfileRepositoryMock();
  let mockApiClient = makeApiClientMock();
  let sut: CreateHotspotUser;

  beforeEach(() => {
    mockUserRepo = makeUserRepositoryMock();
    mockProfileRepo = makeProfileRepositoryMock();
    mockApiClient = makeApiClientMock();

    sut = new CreateHotspotUser(mockUserRepo, mockProfileRepo, mockApiClient);
  });

  it('deve criar usuário com dados válidos', async () => {
    mockProfileRepo.findById.mockResolvedValue({ id: 'profile1' } as any);

    await sut.execute({
      username: validHotspotUser.username,
      password: validHotspotUser.password,
      profileId: validHotspotUser.profileId
    });

    expect(mockUserRepo.save).toHaveBeenCalled();
    expect(mockApiClient.addUser).toHaveBeenCalled();
  });
});
```

🧠 Essa abordagem melhora **clareza, reuso e consistência** dos testes.

---

## 🧪 5.E Simulando _Test Doubles_ para Erros

Você pode fazer mocks que simulam falhas:

```ts
mockUserRepo.save.mockRejectedValue(new Error('DB error'));
```

Ou para simular exceções do API client:

```ts
mockApiClient.addUser.mockRejectedValue(new Error('API Down'));
```

Isso permite testar **tratamento de erros no UseCase**, não apenas o caminho feliz.

---

## 🧪 5.F Testando Comportamento de Fluxo Completo

Imagine um UseCase que compõe várias dependências:

```ts
await expect(
  sut.execute({ username: 'x', password: 'p', profileId: 'p' })
).rejects.toThrow('Perfil não encontrado');
```

Aqui você está testando o _fluxo_ inteiro de regras do negócio — e não apenas um único método.

---

## 📈 Dicas Avançadas de Boas Práticas de Testes

### 🧠 Testes sempre isolados

Cada teste deve ser independente — nada de usar o mesmo mock em dois testes diferentes com mutações inesperadas.

👉 Use `beforeEach` para reiniciar mocks.

---

### 🔍 Nomes de testes claros

Sempre descreva o **comportamento esperado**, não a implementação.

❌ _should call save_
✅ _deve criar usuário quando dados forem válidos_

---

### 🧠 Priorize testes de regra de negócio

Como Mikhmon gerencia usuários, perfis e vouchers, foque em:

✔ Non-duplication de usernames
✔ Validação de quantidades válidas de vouchers
✔ Perfis inexistentes
✔ Regras de expiração de vouchers
✔ Erros de comunicação com API MikroTik

Esses cenários capturam o valor real do sistema além do happy path.

---

## 📌 Porque tudo isso importa

A modelagem e testes que criamos refletem funcionalidades reais do **Mikhmon / Mikrotik Hotspot Monitor**, por exemplo:

✔ Adicionar/editar/remover usuários Hotspot
✔ Gerar e imprimir vouchers
✔ Gerenciar perfis
✔ Exibir relatórios e sessões ativos
✔ Suporte a múltiplos roteadores e exportação de dados ([GitHub][1])

---

Se você quiser, posso também gerar **exemplos de testes de integração com um framework de API (como Fastify ou Express)** e **configuração de testes e2e com supertest ou Cypress**, para completar o pipeline de testes! 🚀

[1]: https://github.com/marketplace/dailylepedia?utm_source=chatgpt.com 'MIKHMON V3 · GitHub Marketplace · GitHub'
