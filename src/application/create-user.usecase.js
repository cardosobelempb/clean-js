module.exports = function createUserUseCase({userRepository}){
  return async function({firstName, lastName, cpf, phone, address, email}){
    await userRepository.create({
      firstName, lastName, cpf, phone, address, email
    })
  }
}

/**
 * requisição -> aplicação -> rota -> controller - usecase -> repository
 */