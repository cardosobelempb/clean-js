const supertest = require('supertest')

const request = supertest('http://localhost:3001')

describe('Server =>', () => {
  it('Deve responder na porta 3001', async () => {
    await request.get('/').then((resp) => expect(resp.status).toBe(200))
  })
})