/**
 * @description: ATENÇÃO, esta classe não deve ser instânciada diretamente, use um dos métodos Left ou Right
 */
module.exports = class Either {
  constructor(left, right) {
    this.left = left;
    this.right = right;
  }

  static left(left) {
    return new Either(left, null);
  }

  static right(right) {
    return new Either(null, right);
  }

  static requiredField(valor) {
    return { message: `${valor} já cadastrado` };
  }
};
