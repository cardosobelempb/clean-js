const AppError = require('../shared/errors/AppError');
module.exports = function createUserUseCase({ userRepository }) {
  if (!userRepository) throw new AppError(AppError.dependencias);

  return async function ({ firstName, lastName, cpf, phone, address, email }) {
    const checaCampo = firstName && cpf && phone;
    if (!checaCampo) throw new AppError(AppError.REQUIRED);
    await userRepository.create({
      firstName,
      lastName,
      cpf,
      phone,
      address,
      email
    });
  };
};

/**
 * requisição -> aplicação -> rota -> controller - usecase -> repository
 */
