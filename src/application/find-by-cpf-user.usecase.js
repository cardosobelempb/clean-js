const { Either, AppError } = require('../shared/errors');
module.exports = function findByCpfUserUseCase({ userRepository }) {
  if (!userRepository) throw new AppError(AppError.dependencias);

  return async function ({ cpf }) {
    // const checaCpfExiste = await userRepository.existeCpf(cpf);
    // if (checaCpfExiste) return Either.Left(Either.valorJaCadastrado('cpf'));

    const user = await userRepository.findByCpf(cpf);

    return Either.Right(user);
  };
};

/**
 * requisição -> aplicação -> rota -> controller - usecase -> repository
 */
