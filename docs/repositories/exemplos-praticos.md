## 5️⃣ Exemplos Práticos de Uso

```ts
const userRepository = new UserRepository(prisma.user);

const user = await userRepository.findById('123');

if (!user) throw new Error('Usuário não encontrado');

await userRepository.softDelete(user.id);
```
