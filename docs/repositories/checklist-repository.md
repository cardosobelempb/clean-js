# ✅ Checklist de Criação de Repository (Padrão de Projeto)

## 1️⃣ Conceito & Responsabilidade (SRP)

✔ O repository **representa uma entidade do domínio**
✔ Ele **não contém regra de negócio**
✔ Ele **não conhece controllers, services ou use cases**
✔ Ele **não executa validações de domínio**

❌ **Erro comum**

> Colocar `if`, regras condicionais ou decisões de negócio no repository

💡 **Justificativa**
Repository é **camada de acesso a dados**, não de decisão.

---

## 2️⃣ Contrato no Domínio (DIP)

✔ Existe uma **interface no domínio** (`IUserRepository`)
✔ A interface **não depende de ORM**
✔ Tipos são **entidades de domínio**, não DTOs
✔ Métodos representam **intenção**, não implementação

📌 Exemplo correto:

```ts
findByEmail(email: string): Promise<User | null>
```

❌ Errado:

```ts
findByEmail(email: string): Promise<UserModel>
```

💡 **Impacto**

- Facilita testes
- Permite troca de ORM
- Protege o domínio

---

## 3️⃣ Reutilização via BaseRepository

✔ CRUD **não é reescrito**
✔ Métodos comuns vêm do `BaseRepository`
✔ Apenas queries específicas ficam no repository concreto
✔ Não há duplicação de código entre repositories

❌ Erro comum:

> Copiar `findById` para todo repository

📌 Regra de ouro:

> **Se 2 repositories têm o mesmo método → ele deve estar no BaseRepository**

---

## 4️⃣ Nomenclatura Clara e Semântica (Clean Code)

✔ Métodos começam com **verbos**
✔ Nomes expressam **intenção**
✔ Não expõem detalhes técnicos

✔ Exemplos bons:

- `findById`
- `findByEmail`
- `exists`
- `softDelete`

❌ Exemplos ruins:

- `getUser`
- `fetchData`
- `queryUserTable`

💡 **Justificativa**
Código é lido muito mais do que escrito.

---

## 5️⃣ Tipagem Forte e Explícita (TypeScript)

✔ Nunca usar `any`
✔ Retornos são explícitos
✔ `null` é tratado conscientemente
✔ Tipos genéricos são bem definidos

📌 Exemplo:

```ts
async findById(id: string): Promise<User | null>
```

❌ Erro comum:

```ts
async findById(id) {
  return this.repo.findOne(id);
}
```

---

## 6️⃣ Queries Claras e Simples (KISS)

✔ Cada método faz **uma coisa só**
✔ Queries são legíveis
✔ Não há lógica condicional complexa

❌ Evitar:

- Métodos gigantes
- Queries mágicas
- Abstrações desnecessárias

💡 Se ficou difícil de ler → está errado.

---

## 7️⃣ Performance e Escalabilidade

✔ Uso de índices conhecidos
✔ Métodos críticos têm paginação
✔ `findAll()` é usado com cautela
✔ `exists()` evita consultas desnecessárias

📌 Exemplo:

```ts
async exists(id: string): Promise<boolean>
```

💡 **Impacto**

- Menos carga no banco
- Menos latência
- Mais previsibilidade

---

## 8️⃣ Soft Delete (quando aplicável)

✔ Existe padrão para soft delete
✔ Queries ignoram registros deletados
✔ Nome do campo é padronizado (`deletedAt`)

❌ Erro comum:

> Misturar delete físico e lógico sem critério

---

## 9️⃣ Testabilidade

✔ Repository pode ser mockado facilmente
✔ Interface facilita testes unitários
✔ Não depende de estado global

📌 Boa prática:

- Mockar interface no service/use case
- Testar repository com banco isolado

---

## 🔟 Tratamento de Erros

✔ Repository **não lança erro de regra de negócio**
✔ Erros são técnicos (DB, conexão, constraint)
✔ Mensagens não vazam detalhes sensíveis

💡 Regra:

> Repository **informa**, Service **decide**

---

## 1️⃣1️⃣ Estrutura de Pastas

✔ Separação clara entre domínio e infra
✔ Nome do arquivo reflete a entidade

📁 Exemplo:

```
domain/
 └─ repositories/
    └─ IUserRepository.ts

infra/
 └─ repositories/
    └─ UserRepository.ts
```

---

## 1️⃣2️⃣ Documentação & Padronização

✔ Repository segue template padrão
✔ Checklist é usado em PR
✔ Time conhece as regras

💡 **Sugestão**
Transforme este checklist em:

- Template de PR
- Template de issue
- Documento oficial do projeto

---

## 📌 Checklist Rápido para PR (copiar/colar)

```
[ ] Repository tem responsabilidade única
[ ] Interface no domínio
[ ] Sem regra de negócio
[ ] CRUD reutilizado do BaseRepository
[ ] Tipagem forte
[ ] Métodos bem nomeados
[ ] Queries simples
[ ] Preparado para testes
```
