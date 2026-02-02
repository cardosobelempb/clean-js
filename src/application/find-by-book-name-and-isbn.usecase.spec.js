const { describe, expect, it } = require('@jest/globals');
const findByBookNameAndIsbnUseCase = require('./find-by-book-name-and-isbn.usecase');
const { AppError, Either } = require('../shared/errors');

describe('FindByBookNameAndIsbnUseCase', () => {
  const bookRepository = {
    findByBookAndIsbnName: jest.fn()
  };

  it('deve poder buscar um book pelo name ou isbn', async () => {
    const searchDTO = {
      valor: 'valor_cadastrado'
    };
    const outputDTO = [
      {
        id: 1,
        name: 'book',
        quantity: 5,
        author: 'Autor',
        gender: 'Drama',
        isbn: searchDTO.value
      }
    ];
    bookRepository.findByBookAndIsbnName.mockResolvedValue(outputDTO);

    const sut = findByBookNameAndIsbnUseCase({ bookRepository });
    const output = await sut(searchDTO);

    expect(output.right).toStrictEqual(outputDTO);
    expect(bookRepository.findByBookAndIsbnName).toHaveBeenCalledWith(
      searchDTO.valor
    );
    expect(bookRepository.findByBookAndIsbnName).toHaveBeenCalledTimes(1);
  });

  it('deve retornar null se não existir nenhum book com name informado', async () => {
    bookRepository.findByBookAndIsbnName.mockResolvedValue(null);
    const searchDTO = {
      valor: 'valor_nao_cadastrado'
    };
    const sut = findByBookNameAndIsbnUseCase({ bookRepository });
    const output = await sut(searchDTO);

    expect(output.right).toBeNull();
    expect(bookRepository.findByBookAndIsbnName).toHaveBeenCalledWith(
      searchDTO.valor
    );
    expect(bookRepository.findByBookAndIsbnName).toHaveBeenCalledTimes(1);
  });

  it('deve retornar um throw AppErro se o bookRepository não for fornecido', async () => {
    expect(() => findByBookNameAndIsbnUseCase({})).toThrow(
      new AppError(AppError.dependencias)
    );
  });

  it('deve retornar um Either.left se os campos obrigatórios não forem fornecido', async () => {
    const sut = findByBookNameAndIsbnUseCase({ bookRepository });

    const output = await sut({});
    expect(output.left).toStrictEqual(Either.valorJaCadastrado('valor'));
  });
});
