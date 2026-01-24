module.exports = function createUserUseCase({userRepository}){
  if(!userRepository) throw new Error('userRepository não fornecido')
  return async function({firstName, lastName, cpf, phone, address, email}){
    await userRepository.create({
      firstName, lastName, cpf, phone, address, email
    })
  }
}

/**
 * requisição -> aplicação -> rota -> controller - usecase -> repository
 */