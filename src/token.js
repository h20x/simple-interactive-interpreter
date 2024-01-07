const TokenType = {
  NUM: 0,
  EOF: 1,
  PLUS: 2,
  MINUS: 3,
  MUL: 4,
  DIV: 5,
  LPAR: 6,
  RPAR: 7,
  MOD: 8,
  ID: 9,
  ASGN: 10,
  FNKEY: 11,
  FNOP: 12,
  FNCALL: 13,
};

class Token {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
}

module.exports = {
  Token,
  TokenType,
};
