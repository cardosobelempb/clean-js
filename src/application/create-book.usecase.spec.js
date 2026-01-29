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
  findById: jest.fn()
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

  it.skip('deve retornar um throw AppErro se os campos obrigatórios não forem fornecido', async () => {
    const sut = createBookUseCase({ bookRepository });
    await expect(() => sut({})).rejects.toThrow(
      new AppError(AppError.REQUIRED)
    );
  });

  it.skip('deve retornar Either.left se o ISBN já estiver cadastrado', async () => {
    bookRepository.existeCpf.mockResolvedValue(true);
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
    expect(output.left).toEqual(Either.valorJaCadastrado('cpf'));
    expect(bookRepository.existeCpf).toHaveBeenCalledWith(bookDTO.cpf);
    expect(bookRepository.existeCpf).toHaveBeenCalledTimes(1);
  });

  it.skip('deve retornar um Either.left se já existir um castrado com o email', async () => {
    bookRepository.existeCpf.mockResolvedValue(false);
    bookRepository.existeEmail.mockResolvedValue(true);
    const bookDTO = {
      firstName: 'fistName_valid',
      lastName: 'lastName_valid',
      cpf: 'cpf_valid',
      phone: 'phone_valid',
      address: 'address_valid',
      email: 'email_ja_cadastrado'
    };

    const sut = createBookUseCase({ bookRepository });
    const output = await sut(bookDTO);

    expect(output.right).toBeNull();
    expect(output.left).toEqual(Either.valorJaCadastrado('email'));
    expect(bookRepository.existeEmail).toHaveBeenCalledWith(bookDTO.email);
    expect(bookRepository.existeEmail).toHaveBeenCalledTimes(1);
  });
});
