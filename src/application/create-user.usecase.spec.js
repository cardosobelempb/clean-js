const { describe, expect, it, fn } = require('@jest/globals');
const createUserUseCase = require('./create-user.usecase');
const AppError = require('../shared/errors/AppError');

describe('Cadastrar um usuário Usecase', () => {
  const userRepository = {
    create: jest.fn()
  };

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

    expect(output).toBeUndefined();
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
});
