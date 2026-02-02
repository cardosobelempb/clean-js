const { Either, AppError } = require('../shared/errors');
module.exports = function findByCpfUserUseCase({ userRepository }) {
  if (!userRepository) throw new AppError(AppError.dependencias);

  return async function ({ cpf }) {
    if (!cpf) return Either.left(Either.valorJaCadastrado('cpf'));

    const user = await userRepository.findByCpf(cpf);

    return Either.right(user);
  };
};

/**
 * requisição -> aplicação -> rota -> controller - usecase -> repository
 */
