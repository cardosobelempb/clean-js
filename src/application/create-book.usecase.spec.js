const { describe, expect, it } = require('@jest/globals');
const { AppError, Either } = require('../shared/errors');
const createBookUseCase = require('./create-book.usecase');

/**
 * Factory para criar um repositório mockado
 * Evita repetição e centraliza alterações futuras
 */
const makeBookRepositoryMock = () => ({
  create: jest.fn(),
  existeCpf: jest.fn(),
  existeEmail: jest.fn(),
  findById: jest.fn(),
  existeIsbn: jest.fn()
});

describe('CreateBookUsecase', () => {
  let bookRepository = makeBookRepositoryMock;
  beforeEach(() => {
    // Garante isolamento entre os testes
    bookRepository = makeBookRepositoryMock();
    jest.clearAllMocks();
  });

  it('deve cadastrar um book com sucesso', async () => {
    // Arrange
    const bookDTO = {
      name: 'Book válido',
      quantity: 10,
      author: 'Autor válido',
      gender: 'Ficção',
      isbn: 'ISBN_VALIDO'
    };

    const sut = createBookUseCase({ bookRepository });
    const output = await sut(bookDTO);

    expect(output.right).toBeNull();
    expect(bookRepository.create).toHaveBeenCalledWith(bookDTO);
    expect(bookRepository.create).toHaveBeenCalledTimes(1);
  });

  it('deve lançar AppError se o repositório não for fornecido', async () => {
    expect(() => createBookUseCase({})).toThrow(
      new AppError(AppError.dependencias)
    );
  });

  it('deve lançar AppError quando os campos obrigatórios não são informados', async () => {
    // Arrange
    const sut = createBookUseCase({ bookRepository });
    const invalidInput = {};

    // Act & Assert
    await expect(sut(invalidInput)).rejects.toThrow(
      new AppError(AppError.REQUIRED)
    );
    await expect(sut(invalidInput)).rejects.toMatchObject({
      message: AppError.REQUIRED
    });
  });

  it('deve retornar Either.left se o ISBN já estiver cadastrado', async () => {
    bookRepository.existeIsbn.mockResolvedValue(true);
    const bookDTO = {
      name: 'Book duplicado',
      quantity: 5,
      author: 'Autor',
      gender: 'Drama',
      isbn: 'ISBN_DUPLICADO'
    };

    const sut = createBookUseCase({ bookRepository });
    const output = await sut(bookDTO);

    expect(output.right).toBeNull();
    expect(output.left).toEqual(Either.valorJaCadastrado('ISBN'));
    expect(bookRepository.existeIsbn).toHaveBeenCalledWith(bookDTO.isbn);
    expect(bookRepository.existeIsbn).toHaveBeenCalledTimes(1);
  });
});
