const { Parser } = require('./parser');
const { Visitor, Num, FnDef } = require('./tree');

describe('Parser', () => {
  let parser;

  beforeEach(() => {
    parser = new Parser(
      new Map([
        ['F0', new FnDef('F0', [], new Num(0))],
        ['F1', new FnDef('F1', ['a'], new Num(1))],
        ['F2', new FnDef('F2', ['a', 'b'], new Num(2))],
        ['F3', new FnDef('F3', ['a', 'b', 'c'], new Num(3))],
      ])
    );
  });

  test.each([
    ['', ''],
    ['  ', ''],
    ['x', 'Var(x)'],
    ['-x', 'UnaryOp(-, Var(x))'],
    ['x + 1', 'BinOp(+, Var(x), Num(1))'],
    ['x + 1 * y', 'BinOp(+, Var(x), BinOp(*, Num(1), Var(y)))'],
    ['x = 1', 'Asgn(Var(x), Num(1))'],
    ['x = y', 'Asgn(Var(x), Var(y))'],
    ['x = 1 + 1', 'Asgn(Var(x), BinOp(+, Num(1), Num(1)))'],
    ['x = y + 1', 'Asgn(Var(x), BinOp(+, Var(y), Num(1)))'],
    [
      'x = 1 - (y + 1)',
      'Asgn(Var(x), BinOp(-, Num(1), BinOp(+, Var(y), Num(1))))',
    ],
    ['x = y = 1', 'Asgn(Var(x), Asgn(Var(y), Num(1)))'],
    ['((1 + 1))', 'BinOp(+, Num(1), Num(1))'],
    ['fn sum x y => x + y', 'FnDef(sum, [x, y], BinOp(+, Var(x), Var(y)))'],
    ['F0 * y', 'BinOp(*, FnCall(F0, []), Var(y))'],
    ['F2 1 2 - 3', 'FnCall(F2, [Num(1), BinOp(-, Num(2), Num(3))])'],
    [
      'F2 1 2 * F2 x 3',
      'FnCall(F2, [Num(1), BinOp(*, Num(2), FnCall(F2, [Var(x), Num(3)]))])',
    ],
    [
      'F2 1 2 * F2 3 F2 4 5',
      'FnCall(F2, [Num(1), BinOp(*, Num(2), FnCall(F2, [Num(3), FnCall(F2, [Num(4), Num(5)])]))])',
    ],
    [
      'F2 1 2 * F0 * F1 5',
      'FnCall(F2, [Num(1), BinOp(*, BinOp(*, Num(2), FnCall(F0, [])), FnCall(F1, [Num(5)]))])',
    ],
    ['F2 (x = 1) 2', 'FnCall(F2, [Asgn(Var(x), Num(1)), Num(2)])'],
    [
      '(F2 ((2 * F2 a b)) (c)) + 1',
      'BinOp(+, FnCall(F2, [BinOp(*, Num(2), FnCall(F2, [Var(a), Var(b)])), Var(c)]), Num(1))',
    ],
    [
      'F3 1 F2 a b 3',
      'FnCall(F3, [Num(1), FnCall(F2, [Var(a), Var(b)]), Num(3)])',
    ],
    [
      'fn calc x y => (F2 x x * F2 x y) * (F1 (y * x)) + x',
      'FnDef(calc, [x, y], BinOp(+, BinOp(*, FnCall(F2, [Var(x), BinOp(*, Var(x), FnCall(F2, [Var(x), Var(y)]))]), FnCall(F1, [BinOp(*, Var(y), Var(x))])), Var(x)))',
    ],
    [
      'fn calc x y => F2 x x * F2 x y * (F1 (y * x)) + x',
      'FnDef(calc, [x, y], FnCall(F2, [Var(x), BinOp(*, Var(x), FnCall(F2, [Var(x), BinOp(+, BinOp(*, Var(y), FnCall(F1, [BinOp(*, Var(y), Var(x))])), Var(x))]))]))',
    ],
  ])('%s', (expr, expected) => {
    const tree = parser.parse(expr);
    expect(new Stringifier().visit(tree)).toBe(expected);
  });

  test.each([
    ['()'],
    ['(1+1))'],
    ['((1+1)'],
    [')(1+1)'],
    ['(1+1)('],
    ['(1+1'],
    ['1+1)'],
    ['1+1-'],
    ['1 (1 + 2)'],
    ['10 *'],
    ['1-*1'],
    ['1)'],
    ['1 = 1'],
    ['1 = x'],
    ['x = 1 = y'],
    ['x = '],
    ['x + '],
    ['(1 =)'],
    ['(x =)'],
    ['fn 1 x y'],
    ['fn avg => (x + y) / 2', `Unknown identifier 'x'`],
    ['fn add a b => a + c', `Unknown identifier 'c'`],
    ['fn add x x => x + x'],
    ['F2 1 2 +'],
    ['F2 1 = x y'],
    ['F1'],
    ['F2 1'],
    ['F2 1 2 3'],
  ])('should fail: %s', (expr, err = 'Parsing error') => {
    expect(() => parser.parse(expr)).toThrow(new Error(err));
  });
});

class Stringifier extends Visitor {
  visit(node) {
    if (null == node) {
      return '';
    }

    return super.visit(node);
  }

  visitBinOp(node) {
    const left = `${this.visit(node.left)}`;
    const right = `${this.visit(node.right)}`;

    return `${node.constructor.name}(${node.op}, ${left}, ${right})`;
  }

  visitNum(node) {
    return `${node.constructor.name}(${node.value})`;
  }

  visitUnaryOp(node) {
    return `${node.constructor.name}(${node.op}, ${this.visit(node.right)})`;
  }

  visitVariable(node) {
    return `${node.constructor.name}(${node.name})`;
  }

  visitAssign(node) {
    const left = `${this.visit(node.left)}`;
    const right = `${this.visit(node.right)}`;

    return `${node.constructor.name}(${left}, ${right})`;
  }

  visitFnDef(node) {
    const args = node.args.join(', ');
    const body = this.visit(node.body);

    return `${node.constructor.name}(${node.name}, [${args}], ${body})`;
  }

  visitFnCall(node) {
    const args = node.args.map((arg) => this.visit(arg)).join(', ');

    return `${node.constructor.name}(${node.name}, [${args}])`;
  }
}
