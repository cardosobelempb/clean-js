# 🔟 Guia Oficial de Arquitetura do Projeto

> **Documento vivo** para o time

---

## 🧠 Princípios Fundamentais

1. Domínio é independente
2. Infra é detalhe
3. Regras de negócio ficam em Use Cases
4. Repositories são contratos
5. Controllers só traduzem entrada/saída

---

## 📁 Estrutura Oficial

```
src/
 ├─ domain/
 │   ├─ entities/
 │   ├─ repositories/
 │   └─ errors/
 ├─ application/
 │   └─ use-cases/
 ├─ interfaces/
 │   └─ http/
 │       ├─ controllers/
 │       ├─ presenters/
 │       └─ validators/
 └─ infra/
     ├─ database/
     └─ repositories/
```

---

## 🧱 Responsabilidades por Camada

### Domain

✔ Entidades
✔ Regras invariantes
✔ Interfaces de repository
❌ Frameworks

---

### Application (Use Cases)

✔ Regras de negócio
✔ Orquestração
✔ Decisões
❌ HTTP / DB

---

### Interfaces (HTTP)

✔ Controllers
✔ Validação
✔ Presenters
❌ Regras de negócio

---

### Infra

✔ ORM
✔ Banco
✔ Implementações
❌ Decisão de negócio

---

## 📌 Regras Oficiais do Time

- ❌ Controller não acessa repository
- ❌ Use case não conhece HTTP
- ❌ Repository não valida entrada
- ✔ Erros de domínio são classes
- ✔ Schema valida entrada
- ✔ Presenter formata saída

---

## 🧪 Estratégia de Testes

| Camada     | Tipo        |
| ---------- | ----------- |
| Domain     | Unit        |
| Use Case   | Unit        |
| Repository | Integration |
| Controller | Integration |

---

## 🧠 Convenções de Nomenclatura

- Repository → `findBy`, `existsBy`
- Use Case → verbo + entidade
- Controller → entidade + ação
- Schema → verbo + entidade + Schema

---

## 🎯 Regra de Ouro Final

> **Se uma mudança no banco quebra o domínio, a arquitetura está errada.**

---

## 📦 Como usar isso no time

Sugestão prática:

- Colar o guia no README
- Criar template de PR
- Usar em onboarding
- Revisar PRs com checklist

---

## 🚀 Próximo nível (opcional)

Posso entregar:

- **Testes unitários completos**
- **Specification Pattern**
- **Unit of Work**
- **CQRS**
- **Exemplo com NestJS**
- **Monorepo**

👉 Quer seguir para qual agora?
