const { AppError, Either } = require('../shared/errors');

module.exports = function createUserUseCase({ userRepository }) {
  if (!userRepository) throw new AppError(AppError.dependencias);

  return async function ({ firstName, lastName, cpf, phone, address, email }) {
    const checaCampo = firstName && cpf && phone;
    if (!checaCampo) throw new AppError(AppError.REQUIRED);
    const checaCpfExiste = await userRepository.existeCpf(cpf);
    if (checaCpfExiste) return Either.Left(Either.valorJaCadastrado('cpf'));

    const checaEmailExiste = await userRepository.existeEmail(email);
    if (checaEmailExiste) return Either.Left(Either.valorJaCadastrado('email'));

    await userRepository.create({
      firstName,
      lastName,
      cpf,
      phone,
      address,
      email
    });

    return Either.Right(null);
  };
};

/**
 * requisição -> aplicação -> rota -> controller - usecase -> repository
 */
