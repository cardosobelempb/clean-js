module.export = function createUserUseCase(){
  return async function({firstName, lastNAme, cpf, phone, address, email}){
    await useRepository.create({
      firstName, lastNAme, cpf, phone, address, email
    })
  }
}

/**
 * requisição -> aplicação -> rota -> controller - usecase -> repository
 */