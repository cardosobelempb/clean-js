const { Either, AppError } = require('../shared/errors');
module.exports = function findByBookNameOrIsbnUseCase({ bookRepository }) {
  if (!bookRepository) throw new AppError(AppError.dependencias);

  return async function ({ search }) {
    if (!search) return Either.left(Either.requiredField('search'));

    const books = await bookRepository.findByNameOrIsbn(search);

    return Either.right(books);
  };
};

/**
 * requisição -> aplicação -> rota -> controller - usecase -> repository
 */
