const request = require('supertest');
const app = require('../../src/app');

describe('User', () => {
  it('Deve listar os usuários', async () => {
    await request(app)
      .get('/users')
      .then(res => {
        expect(res.status).toStrictEqual(200);
        expect(res.body.length).toBeGreaterThan(0);
        // expect(res.body[0]).toHaveProperty('name', 'John Doe');
      });
  });
  it('Deve inserir usuários com sucesso', async () => {
    const email = `${Date.now()}@mail.com`;
    await request(app)
      .post('/users')
      .send({
        first_name: 'Walter ',
        last_name: 'Mitty',
        email,
        password: '123456'
      })
      .then(res => {
        expect(res.status).toStrictEqual(201);
        expect(res.body).toStrictEqual({
          id: res.body.id,
          first_name: 'Walter ',
          last_name: 'Mitty',
          email,
          password: '123456'
        });
      });
  });
});
