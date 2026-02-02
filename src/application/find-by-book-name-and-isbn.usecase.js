const { Either, AppError } = require('../shared/errors');
module.exports = function findByBookNameAndIsbnUseCase({ bookRepository }) {
  if (!bookRepository) throw new AppError(AppError.dependencias);

  return async function ({ valor }) {
    if (!valor) return Either.left(Either.valorJaCadastrado('valor'));

    const books = await bookRepository.findByBookAndIsbnName(valor);

    return Either.right(books);
  };
};

/**
 * requisição -> aplicação -> rota -> controller - usecase -> repository
 */
