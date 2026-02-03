const { describe, expect, it } = require('@jest/globals');
const findByBookNameOrIsbnUseCase = require('./find-by-book-name-or-isbn.usecase');
const { AppError, Either } = require('../shared/errors');
const makeBookRepositoryMock = require('./repositories/makeBookRepositoryMock');

describe('findByBookNameOrIsbnUseCase', () => {
  let bookRepository = makeBookRepositoryMock;
  beforeEach(() => {
    // Garante isolamento entre os testes
    bookRepository = makeBookRepositoryMock();
    jest.clearAllMocks();
  });
  it('deve buscar livros pelo nome ou ISBN', async () => {
    const inputDTO = {
      search: 'valor_cadastrado'
    };
    const books = [
      {
        id: 1,
        name: 'book',
        quantity: 5,
        author: 'Autor',
        gender: 'Drama',
        isbn: inputDTO.value
      }
    ];
    bookRepository.findByNameOrIsbn.mockResolvedValue(books);

    const sut = findByBookNameOrIsbnUseCase({ bookRepository });
    const result = await sut(inputDTO);

    expect(result.right).toStrictEqual(books);
    expect(bookRepository.findByNameOrIsbn).toHaveBeenCalledWith(
      inputDTO.search
    );
    expect(bookRepository.findByNameOrIsbn).toHaveBeenCalledTimes(1);
  });

  it('deve retornar array vazio quando nenhum livro for encontrado', async () => {
    bookRepository.findByNameOrIsbn.mockResolvedValue([]);
    const inputDTO = {
      search: 'valor_nao_cadastrado'
    };
    const sut = findByBookNameOrIsbnUseCase({ bookRepository });
    const result = await sut(inputDTO);

    expect(result.right).toEqual([]);
    expect(bookRepository.findByNameOrIsbn).toHaveBeenCalledWith(
      inputDTO.search
    );
    expect(bookRepository.findByNameOrIsbn).toHaveBeenCalledTimes(1);
  });

  it('deve retornar array vazio quando nenhum livro for encontrado', async () => {
    // Arrange
    bookRepository.findByNameOrIsbn.mockResolvedValue([]);

    const sut = findByBookNameOrIsbnUseCase({ bookRepository });

    // Act
    const result = await sut({ search: 'nao_existe' });

    // Assert
    expect(result.right).toEqual([]);
  });

  it('deve lançar AppError se bookRepository não for fornecido', async () => {
    expect(() => findByBookNameOrIsbnUseCase({})).toThrow(
      new AppError(AppError.dependencias)
    );
  });

  it('deve retornar Either.left se search não for informado', async () => {
    const sut = findByBookNameOrIsbnUseCase({ bookRepository });

    const result = await sut({});
    expect(result.left).toStrictEqual(Either.requiredField('search'));
  });
});
