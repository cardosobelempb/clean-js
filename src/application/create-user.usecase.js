const { AppError, Either } = require('../shared/errors');

module.exports = function createUserUseCase({ userRepository }) {
  if (!userRepository) throw new AppError(AppError.dependencias);

  return async function ({ firstName, lastName, cpf, phone, address, email }) {
    const checaCampo = firstName && cpf && phone;
    if (!checaCampo) throw new AppError(AppError.REQUIRED);
    const checaCpfExiste = await userRepository.existeCpf(cpf);
    if (checaCpfExiste) return Either.left(Either.valorJaCadastrado('cpf'));

    const checaEmailExiste = await userRepository.existeEmail(email);
    if (checaEmailExiste) return Either.left(Either.valorJaCadastrado('email'));

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
