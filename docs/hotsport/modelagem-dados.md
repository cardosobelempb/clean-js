Perfeito — com base no **domínio e nas funcionalidades reais do Mikhmon** (MikroTik Hotspot Monitor), exploradas pela documentação e uso prático da ferramenta, podemos agora projetar a **modelagem aprofundada do item 1 — Modelagem das _Entidades do Domínio_** para a Arquitetura Limpa. ([GitHub][1])

---

# 🧠 1. Modelagem das **Entidades do Domínio** (Domain Entities)

📌 _Entidades_ são os pilares da lógica de negócio — elas representam os modelos conceituais mais importantes do sistema. Em arquitetura limpa, o domínio **não depende de nada externo** (como frameworks, DB ou API), e foca apenas nas regras do negócio em si.

---

## 📌 Principais entidades para Mikhmon

Com base nas principais **features** (adicionar/editar/deletar usuários, perfis, vouchers, relatórios, sessões, etc.) documentadas publicamente para Mikhmon: ([GitHub][1])

---

## 🧱 1. `HotspotUser` — Usuário do Hotspot

### 📌 Responsabilidade

Representa um usuário configurado no Hotspot do MikroTik com regras específicas.

---

### 📦 Atributos principais

| Campo       | Tipo    | O que representa                          |
| ----------- | ------- | ----------------------------------------- |
| `id`        | string  | Identificador único da entidade           |
| `username`  | string  | Nome de usuário para login                |
| `password`  | string  | Senha do usuário                          |
| `profileId` | string  | Referência ao perfil associado            |
| `expiredAt` | Date    | Data/hora de expiração (quando aplicável) |
| `isActive`  | boolean | Flag se o usuário está ativo              |
| `createdAt` | Date    | Quando o usuário foi criado               |
| `updatedAt` | Date    | Quando o usuário foi modificado           |

---

### 🔍 Regras de Negócio

✔ O nome de usuário deve ser **único** no contexto do hotspot — duplicatas não são permitidas.
✔ A senha deve satisfazer regras de complexidade mínimas (ex.: mínimo de X caracteres).
✔ Um usuário só pode ser ativado se tiver um perfil válido associado.

---

## 🧱 2. `Profile` — Perfil de Usuário / Serviço

### 📌 Responsabilidade

Define políticas como limites de velocidade, tempo de sessão, pacote de serviço etc.

---

### 📦 Atributos principais

| Campo                 | Tipo   | O que representa                    |
| --------------------- | ------ | ----------------------------------- |
| `id`                  | string | Identificador único                 |
| `name`                | string | Nome semântico (ex: “2 h”, “1 Dia”) |
| `bandwidthUp`         | number | Upstream permitido (em Kbps/Mbps)   |
| `bandwidthDown`       | number | Downstream permitido                |
| `validity`            | string | Tempo de validade (ex: “2h”, “1d”)  |
| `price`               | number | Preço (para vouchers)               |
| `createdAt/updatedAt` | Date   | Marcação de timestamp               |

---

### 🔍 Regras de Negócio

✔ Não é permitido criar mais de um perfil com o mesmo nome dentro de um servidor.
✔ Valores de velocidade devem respeitar limites mínimos e máximos (configuráveis).

---

## 🧱 3. `VoucherBatch` — Lote de Vouchers Gerados

### 📌 Responsabilidade

Representa um conjunto de códigos de acesso (username/password) gerados em lote com base em um _Profile_.

---

### 📦 Atributos principais

| Campo            | Tipo     | O que representa               |
| ---------------- | -------- | ------------------------------ |
| `id`             | string   | Identificador único            |
| `profileId`      | string   | Perfil associado               |
| `quantity`       | number   | Quantidade de vouchers gerados |
| `generatedCodes` | string[] | Lista de códigos gerados       |
| `createdAt`      | Date     | Timestamp de criação           |

---

### 🔍 Regras de Negócio

✔ Todos os códigos gerados devem ser únicos.
✔ A validade de cada voucher depende diretamente das regras do _Profile_ associado.

---

## 🧱 4. `ActiveSession` — Sessão de Usuário Ativa

### 📌 Responsabilidade

Representa uma sessão de acesso ativo ao Hotspot (tempo atual de conexão, tráfego etc.).

---

### 📦 Atributos principais

| Campo                   | Tipo   | O que representa       |
| ----------------------- | ------ | ---------------------- |
| `sessionId`             | string | ID de sessão ativo     |
| `username`              | string | Usuário conectado      |
| `clientIp`              | string | Endereço IP do cliente |
| `startedAt`             | Date   | Início da sessão       |
| `lastSeenAt`            | Date   | Última atualização     |
| `trafficUp/trafficDown` | number | Dados trafegados       |

---

### 🔍 Regras de Negócio

✔ Sessões só existem enquanto o usuário estiver autenticado no hotspot.
✔ A cada atualização de sessão, `lastSeenAt` deve ser atualizado.

---

## 🧱 5. `Report` — Relatório de Atividades/Vendas

📌 Responsabilidade
Representa um conjunto de dados agregados para análises de uso, volume de vendas, tráfego, etc.

---

### Exemplo de estrutura

```ts
interface Report {
  period: 'daily' | 'weekly' | 'monthly';
  totalUsers: number;
  totalSessions: number;
  totalRevenue: number;
  createdAt: Date;
}
```

---

## 🧱 6. `RouterConfiguration` — Configuração do Router

📌 Responsabilidade
Agrupa parâmetros usados para se conectar ao Router MikroTik via API.

---

### Campos típicos

```ts
interface RouterConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  apiVersion: string;
}
```

---

# 📌 Entidades x Dependências

Em **Arquitetura Limpa**, as entidades são **independentes de frameworks ou tecnologias**:

```
Domain
  └── Entities
  └── Value Objects (ex: Bandwidth, Expiry)
Use Cases
  └── Interfaces (ex: IRepository)
Infrastructure
  └── MongoDB / MikroTik API Adapter / Redis
UI (Controllers/Routes)
  └── HTTP/CLI/GraphQL
```

---

## 📌 Boas práticas aplicadas

✔ **Clareza de nomes** — entidades refletem o que existem no domínio real de Mikhmon.
✔ **Separação de responsabilidades** — cada entidade tem um conceito único e coeso.
✔ **Independência da infraestrutura** — nenhum detalhe de API/DB está nas entidades.
✔ **Pronto para testes** — cada camada pode facilmente ser testada isoladamente.

---

## 📌 Próximo passo

Agora que as **entidades do domínio** estão modeladas, posso seguir com:

👉 **2. Interfaces de _Repositories_ para cada entidade**
👉 **3. Use Cases completos com regras de negócio**
👉 **4. Exemplos de código TS com testes unitários**
👉 **5. Diagrama de relações entre entidades e casos de uso**

**Quer que eu comece pelo item 2 (Interfaces de Repositório) em TypeScript com exemplos e explicações passo a passo?** 🚀

[1]: https://github.com/marketplace/dailylepedia?utm_source=chatgpt.com 'MIKHMON V3 · GitHub Marketplace · GitHub'
