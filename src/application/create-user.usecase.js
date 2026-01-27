const AppError = require('../shared/errors/AppError');
module.exports = function createUserUseCase({ userRepository }) {
  if (!userRepository) throw new AppError(AppError.dependencias);

  return async function ({ firstName, lastName, cpf, phone, address, email }) {
    const checaCampo = firstName && cpf && phone;
    if (!checaCampo) throw new AppError(AppError.REQUIRED);
    const checaCpfExiste = await userRepository.existeCpf(cpf);
    if (checaCpfExiste) throw new AppError('CPF já cadastrado');
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
