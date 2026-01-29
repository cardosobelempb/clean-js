const { Either, AppError } = require('../shared/errors');

module.exports = function createBookUseCase({ bookRepository }) {
  if (!bookRepository) throw new AppError(AppError.dependencias);

  return async function ({ name, quantity, author, gender, isbn }) {
    // const checaCampo = name && quantity && isbn;
    // if (!checaCampo) throw new AppError(AppError.REQUIRED);
    // const checaExiste = await bookRepository.existeCpf(cpf);
    // if (checaCpfExiste) return Either.Left(Either.valorJaCadastrado('cpf'));

    // const checaEmailExiste = await bookRepository.existeEmail(email);
    // if (checaEmailExiste) return Either.Left(Either.valorJaCadastrado('email'));

    await bookRepository.create({
      name,
      quantity,
      author,
      gender,
      isbn
    });

    return Either.Right(null);
  };
};

/**
 * requisição -> aplicação -> rota -> controller - usecase -> repository
 */
