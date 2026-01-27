const { Either, AppError } = require('../shared/errors');
module.exports = function createUserUseCase({ userRepository }) {
  if (!userRepository) throw new AppError(AppError.dependencias);

  return async function ({ firstName, lastName, cpf, phone, address, email }) {
    const checaCampo = firstName && cpf && phone;
    if (!checaCampo) throw new AppError(AppError.REQUIRED);
    const checaCpfExiste = await userRepository.existeCpf(cpf);
    if (checaCpfExiste) return Either.Left(Either.valorJaCadastrado('cpf'));
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
