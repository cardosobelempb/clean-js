const request = require('supertest')
const app = require('../src/app')

describe('User', () => {
  it('Deve listar os usuários', async () => {
    await request(app).get('/users')
    .then((res) => {
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(res.body[0]).toHaveProperty('name', 'John Doe')
    })
  })
  it('Deve inserir usuários com sucesso', async () => {
    await request(app).post('/users')
    .send({name: 'Walter Mitty', email: 'walter@email.com'})
    .then((res) => {
      expect(res.status).toBe(201)
      expect(res.body.name).toBe('Walter Mitty')
    })
  })
})