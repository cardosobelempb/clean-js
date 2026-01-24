const { describe, expect, it } = require("@jest/globals");
const createUserUseCase = require('./create-user.usecase');

describe('Cadastrar um usuário Usecase', () => {

  const userRepository = {
    create: jest.fn()
  }

  it('deve poder cadastar um usuário', async  () => {
    const userDTO = {
      firstName: 'fistName_valid',
      lastName: 'lastName_valid',
      cpf: 'cpf_valid',
      phone: 'phone_valid',
      address: 'address_valid',
      email: 'email_valid',
    }

    const sut = createUserUseCase({userRepository})
    const output = await sut(userDTO)

    expect(output).toBeUndefined()
    expect(userRepository.create).toHaveBeenCalledWith(userDTO)
    expect(userRepository.create).toHaveBeenCalledTimes(1)
  })
})