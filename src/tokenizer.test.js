const { Tokenizer } = require('./tokenizer');
const { TokenType } = require('./token');

describe('Tokenizer', () => {
  describe('getNextToken()', () => {
    test.each([
      ['%', [TokenType.MOD]],
      ['=', [TokenType.ASGN]],
      ['_', [TokenType.ID]],
      ['_var_name_', [TokenType.ID]],
      ['varName1', [TokenType.ID]],
      ['1.2', [TokenType.NUM]],
      [
        'x = y * (3.3 + 2) / 1.1 % 2',
        [
          TokenType.ID,
          TokenType.ASGN,
          TokenType.ID,
          TokenType.MUL,
          TokenType.LPAR,
          TokenType.NUM,
          TokenType.PLUS,
          TokenType.NUM,
          TokenType.RPAR,
          TokenType.DIV,
          TokenType.NUM,
          TokenType.MOD,
          TokenType.NUM,
        ],
      ],
      [
        'fn sum x y => x + y',
        [
          TokenType.FNKEY,
          TokenType.ID,
          TokenType.ID,
          TokenType.ID,
          TokenType.FNOP,
          TokenType.ID,
          TokenType.PLUS,
          TokenType.ID,
        ],
      ],
      ['sum 1 2', [TokenType.ID, TokenType.NUM, TokenType.NUM]],
    ])('expr: %s', (expr, expected) => {
      const tokenizer = new Tokenizer(expr);

      expected.forEach((type) => {
        expect(tokenizer.getNextToken().type).toBe(type);
      });
    });

    test.each([['1.'], ['1.a']])('should throw an error: %s', (expr) => {
      expect(() => new Tokenizer(expr).getNextToken()).toThrow(
        new Error('Unexpected character')
      );
    });
  });
});
