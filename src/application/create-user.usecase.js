const { AppError, Either } = require('../shared/errors');

module.exports = function createUserUseCase({ userRepository }) {
  if (!userRepository) throw new AppError(AppError.dependencias);

  return async function ({ firstName, lastName, cpf, phone, address, email }) {
    const checaCampo = firstName && cpf && phone;
    if (!checaCampo) throw new AppError(AppError.REQUIRED);
    const existsByCpf = await userRepository.existsByCpf(cpf);
    if (existsByCpf) return Either.left(Either.requiredField('cpf'));

    const existsByEmail = await userRepository.existsByEmail(email);
    if (existsByEmail) return Either.left(Either.requiredField('email'));

    await userRepository.create({
      firstName,
      lastName,
      cpf,
      phone,
      address,
      email
    });

    return Either.right(null);
  };
};

/**
 * requisição -> aplicação -> rota -> controller - usecase -> repository
 */
