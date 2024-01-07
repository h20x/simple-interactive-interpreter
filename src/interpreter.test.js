const { Interpreter } = require('./interpreter');

describe('Interpreter', () => {
  let intr;

  beforeEach(() => {
    intr = new Interpreter();
  });

  test('empty input', () => {
    testInput([
      ['', ''],
      ['  ', ''],
    ]);
  });

  test('arithmetic', () => {
    testInput([
      ['1', 1],
      [' 1 ', 1],
      ['2+2', 4],
      [' 2  +  2 ', 4],
      ['10 + 1 + 2 - 3 + 4 + 6 - 15', 5],
      ['8 / 2 * 2 / 4', 2],
      ['14 + 2 * 3 - 6 / 2', 17],
      ['7 + 3 * (10 / (12 / (3 + 1) - 1)) / (((2 + 3))) - 5 - 3 + (8)', 10],
      ['- 3', -3],
      ['+ 3', 3],
      ['5 - - - + - 3', 8],
      ['5 - - - + - (3 + 4) - +2', 10],
      ['5 % 2', 1],
      ['5.5 + 4.5', 10],
    ]);
  });

  test('variables', () => {
    testInput([
      ['x = 1', 1],
      ['x', 1],
      ['y = 2', 2],
      ['y', 2],
      ['x = x + 3 * (10 / (12 / (3 + 1) - 1)) / (2 + 3) - 5 - 3 + (y)', -2],
      ['x', -2],
      ['x = y = 1', 1],
      ['x', 1],
      ['y', 1],
      ['a = 7', 7],
      ['a + 6', 13],
      ['a = 13 + (b = 3)', 16],
      ['b', 3],
    ]);
  });

  test('unknown identifier', () => {
    testInput([
      ['x', new Error(`Unknown identifier 'x'`)],
      ['x = 1', 1],
      ['x = y', new Error(`Unknown identifier 'y'`)],
    ]);
  });

  test('functions', () => {
    testInput([
      ['fn sum x y => x + y', ''],
      ['sum 1 3', 4],
      ['x = 8', 8],
      ['sum x 8', 16],
      ['fn avg x y => (x + y) / 2', ''],
      ['sum (avg 2 4) 5', 8],
      ['sum (avg 4 x) (sum 2 x)', 16],
      ['fn calc x => (sum x (x * 2)) - (avg x (x * 3)) + x', ''],
      ['calc x', 16],
      ['fn f0 => 0', ''],
      ['f0', 0],
      ['fn echo x => x', ''],
      ['fn add x y => x + y', ''],
      ['echo echo echo echo 8', 8],
      ['add echo 4 echo 12', 16],
    ]);
  });

  function testInput(input) {
    input.forEach(([expr, expected]) => {
      expected instanceof Error
        ? expect(() => intr.input(expr)).toThrow(expected)
        : expect(intr.input(expr)).toBe(expected);
    });
  }
});
