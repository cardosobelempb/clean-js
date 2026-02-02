const { Either, AppError } = require('../shared/errors');

module.exports = function createBookUseCase({ bookRepository }) {
  if (!bookRepository) throw new AppError(AppError.dependencias);

  return async function ({ name, quantity, author, gender, isbn }) {
    const checaCampo = name && quantity && author && gender && isbn;
    if (!checaCampo) throw new AppError(AppError.REQUIRED);

    const checaIsbmExiste = await bookRepository.existeIsbn(isbn);
    if (checaIsbmExiste) return Either.left(Either.valorJaCadastrado('isbn'));

    await bookRepository.create({
      name,
      quantity,
      author,
      gender,
      isbn
    });

    return Either.right(null);
  };
};

/**
 * requisição -> aplicação -> rota -> controller - usecase -> repository
 */
