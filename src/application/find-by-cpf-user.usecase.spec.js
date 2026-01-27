const { describe, expect, it, fn } = require('@jest/globals');
const findByCpfUserUseCase = require('./find-by-cpf-user.usecase');
const { AppError, Either } = require('../shared/errors');

describe('FindByCpfUseCase', () => {
  const userRepository = {
    create: jest.fn(),
    existeCpf: jest.fn(),
    existeEmail: jest.fn(),
    findByCpf: jest.fn()
  };

  it('deve poder buscar um usuário pelo cpf', async () => {
    const cpfDTO = {
      cpf: 'cpf_cadastrado'
    };
    const userDTO = {
      id: 'any_id',
      firstName: 'any_fistName',
      lastName: 'any_lastName',
      cpf: cpfDTO,
      phone: 'any_phone',
      address: 'any_address',
      email: 'any_email'
    };
    userRepository.findByCpf.mockResolvedValue(userDTO);

    const sut = findByCpfUserUseCase({ userRepository });
    const output = await sut(cpfDTO);

    console.log(output.right);

    expect(output.right).toEqual(userDTO);
    expect(userRepository.findByCpf).toHaveBeenCalledWith(cpfDTO.cpf);
    expect(userRepository.findByCpf).toHaveBeenCalledTimes(1);
  });

  it('deve retornar null se não existir nenhum usuário com cpf informado', async () => {
    userRepository.findByCpf.mockResolvedValue(null);
    const cpfDTO = {
      cpf: 'cpf_nao_cadastrado'
    };
    const sut = findByCpfUserUseCase({ userRepository });
    const output = await sut(cpfDTO);

    expect(output.right).toBeNull();
    expect(userRepository.findByCpf).toHaveBeenCalledWith(cpfDTO.cpf);
    expect(userRepository.findByCpf).toHaveBeenCalledTimes(1);
  });

  it('deve retornar um throw AppErro se o userRepository não for fornecido', async () => {
    expect(() => findByCpfUserUseCase({})).toThrow(
      new AppError(AppError.dependencias)
    );
  });

  it('deve retornar um Either.left se os campos obrigatórios não forem fornecido', async () => {
    const sut = findByCpfUserUseCase({ userRepository });

    const output = await sut({});
    expect(output.left).toStrictEqual(Either.valorJaCadastrado('cpf'));
  });
});
