const { Visitor } = require('./tree');
const { Parser } = require('./parser');

class Interpreter extends Visitor {
  constructor() {
    super();
    this._fns = new Map();
    this._stack = [new Map()];
  }

  get _activeFrame() {
    return this._stack[this._stack.length - 1];
  }

  input(expr) {
    const tree = new Parser(new Map(this._fns)).parse(expr);

    if (null == tree) {
      return '';
    }

    return this.visit(tree);
  }

  visitBinOp(node) {
    const { op } = node;
    const a = this.visit(node.left);
    const b = this.visit(node.right);

    switch (op) {
      case '+':
        return a + b;

      case '-':
        return a - b;

      case '*':
        return a * b;

      case '/':
        return a / b;

      case '%':
        return a % b;

      default:
        throw new Error(`Unknown operation '${op}'`);
    }
  }

  visitNum(node) {
    return node.value;
  }

  visitUnaryOp(node) {
    const factor = '-' === node.op ? -1 : 1;

    return this.visit(node.right) * factor;
  }

  visitVariable({ name }) {
    const val = this._activeFrame.get(name);

    if (null == val) {
      throw new Error(`Unknown identifier '${name}'`);
    }

    return val;
  }

  visitAssign({ left, right }) {
    if (this._fns.has(left.name)) {
      throw new Error(
        `Name conflict. Function '${left.name}' is already declared.`
      );
    }

    const val = this.visit(right);
    this._activeFrame.set(left.name, val);

    return val;
  }

  visitFnDef({ name, args, body }) {
    if (this._activeFrame.has(name)) {
      throw new Error(`Name conflict. Variable '${name}' is already declared.`);
    }

    this._fns.set(name, { args, body });

    return '';
  }

  visitFnCall({ name, args }) {
    const fnDef = this._fns.get(name);
    const stackFrame = new Map();

    args.forEach((arg, i) => {
      stackFrame.set(fnDef.args[i], this.visit(arg));
    });

    this._stack.push(stackFrame);
    const result = this.visit(fnDef.body);
    this._stack.pop();

    return result;
  }
}

module.exports = { Interpreter };
