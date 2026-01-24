const { describe, expect, it } = require('@jest/globals')
const AppError = require('./AppError')
describe('AppError', () => {
  it('AppError é uma instância de Error', () => {
    const appError = new AppError('error')
    expect(appError).toBeInstanceOf(Error)
  })

  it('AppError contém a mensagem correta', () => {
    const mensagem = 'Mensagem error'
    const appError = new AppError(mensagem)
    expect(appError.message).toStrictEqual(mensagem)
  })
})