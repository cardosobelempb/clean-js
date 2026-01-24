const {expect} = require('@jest/globals')
describe('Devo conhecer as principais assertivas do jest', () => {
  it('toBeNull', () => {
    let number = null
    expect(number).toBeNull()
  })

  it('not toBeNull', () => {
    let number = null
    number = 10
    expect(number).not.toBeNull()
  })

   it('toBe', () => {
    let number = null
    number = 10
    expect(number).toBe(10)
    expect(number).toEqual(10)
    expect(number).toStrictEqual(10)
  })

  it('not toBe', () => {
    let number = null
    number = 10
    expect(number).toBeGreaterThan(9)
    expect(number).toBeLessThan(11)
  })
})

describe('Devo saber trabahar com objetos', () => {
  it('not toBe', () => {
    const obj = {
      name: 'John',
      email: 'john@mail.com'
    }
    expect(obj).toHaveProperty('name')
    expect(obj).toHaveProperty('name', 'John')
    expect(obj.name).toBe('John')

    const obj2 = {
      name: 'John',
      email: 'john@mail.com'
    }
    expect(obj).toEqual(obj2)
    expect(obj).toBe(obj)
  })
  
})