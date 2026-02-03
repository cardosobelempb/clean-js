/**
 * Factory para criar um repositório mockado
 * Evita repetição e centraliza alterações futuras
 */

module.exports = makeUserRepositoryMock = () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  existsById: jest.fn(),
  existsByCpf: jest.fn(),
  existsByEmail: jest.fn()
});
