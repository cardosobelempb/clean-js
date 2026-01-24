const request = require('supertest')

const app = require('../src/app')

describe('App =>', () => {
  it('Deve responder na raiz', async () => {
    await request(app).get('/')
    .then((resp) => {
      expect(resp.status).toBe(200)
    })
  })
})