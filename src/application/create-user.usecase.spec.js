const { describe, expect, it } = require('@jest/globals');
const { AppError, Either } = require('../shared/errors');
const createUserUseCase = require('./create-user.usecase');

const makeUserRepositoryMock = () => ({
  create: jest.fn(),
  existeCpf: jest.fn(),
  existeEmail: jest.fn()
});

describe('Cadastrar um usuário Usecase', () => {
  let userRepository = makeUserRepositoryMock;
  beforeEach(() => {
    // Garante isolamento entre os testes
    userRepository = makeUserRepositoryMock();
    jest.clearAllMocks();
  });

  it('deve poder cadastar um usuário', async () => {
    const userDTO = {
      firstName: 'fistName_valid',
      lastName: 'lastName_valid',
      cpf: 'cpf_valid',
      phone: 'phone_valid',
      address: 'address_valid',
      email: 'email_valid'
    };

    const sut = createUserUseCase({ userRepository });
    const output = await sut(userDTO);

    expect(output.right).toBeNull();
    expect(userRepository.create).toHaveBeenCalledWith(userDTO);
    expect(userRepository.create).toHaveBeenCalledTimes(1);
  });

  it('deve retornar um throw AppErro se o userRepository não for fornecido', async () => {
    expect(() => createUserUseCase({})).toThrow(
      new AppError(AppError.dependencias)
    );
  });

  it('deve retornar um throw AppErro se os campos obrigatórios não forem fornecido', async () => {
    const sut = createUserUseCase({ userRepository });
    await expect(() => sut({})).rejects.toThrow(
      new AppError(AppError.REQUIRED)
    );
  });

  it('deve retornar um Either.left se já existir um cadastro com o cpf', async () => {
    userRepository.existeCpf.mockResolvedValue(true);
    const userDTO = {
      firstName: 'fistName_valid',
      lastName: 'lastName_valid',
      cpf: 'cpf_ja_cadastrado',
      phone: 'phone_valid',
      address: 'address_valid',
      email: 'email_valid'
    };

    const sut = createUserUseCase({ userRepository });
    const output = await sut(userDTO);

    expect(output.right).toBeNull();
    expect(output.left).toEqual(Either.valorJaCadastrado('cpf'));
    expect(userRepository.existeCpf).toHaveBeenCalledWith(userDTO.cpf);
    expect(userRepository.existeCpf).toHaveBeenCalledTimes(1);
  });

  it('deve retornar um Either.left se já existir um castrado com o email', async () => {
    userRepository.existeCpf.mockResolvedValue(false);
    userRepository.existeEmail.mockResolvedValue(true);
    const userDTO = {
      firstName: 'fistName_valid',
      lastName: 'lastName_valid',
      cpf: 'cpf_valid',
      phone: 'phone_valid',
      address: 'address_valid',
      email: 'email_ja_cadastrado'
    };

    const sut = createUserUseCase({ userRepository });
    const output = await sut(userDTO);

    expect(output.right).toBeNull();
    expect(output.left).toEqual(Either.valorJaCadastrado('email'));
    expect(userRepository.existeEmail).toHaveBeenCalledWith(userDTO.email);
    expect(userRepository.existeEmail).toHaveBeenCalledTimes(1);
  });
});
