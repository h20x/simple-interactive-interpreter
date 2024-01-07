class ASTNode {
  accept(visitor) {
    throw new Error('Unimplemented');
  }
}

class BinOp extends ASTNode {
  constructor(op, left, right) {
    super();
    this.op = op;
    this.left = left;
    this.right = right;
  }

  accept(visitor) {
    return visitor.visitBinOp(this);
  }
}

class Num extends ASTNode {
  constructor(value) {
    super();
    this.value = value;
  }

  accept(visitor) {
    return visitor.visitNum(this);
  }
}

class UnaryOp extends ASTNode {
  constructor(op, right) {
    super();
    this.op = op;
    this.right = right;
  }

  accept(visitor) {
    return visitor.visitUnaryOp(this);
  }
}

class Var extends ASTNode {
  constructor(name) {
    super();
    this.name = name;
  }

  accept(visitor) {
    return visitor.visitVariable(this);
  }
}

class Asgn extends ASTNode {
  constructor(op, left, right) {
    super();
    this.op = op;
    this.left = left;
    this.right = right;
  }

  accept(visitor) {
    return visitor.visitAssign(this);
  }
}

class FnDef extends ASTNode {
  constructor(name, args, body) {
    super();
    this.name = name;
    this.args = args;
    this.body = body;
  }

  accept(visitor) {
    return visitor.visitFnDef(this);
  }
}

class FnCall extends ASTNode {
  constructor(name, args) {
    super();
    this.name = name;
    this.args = args;
  }

  accept(visitor) {
    return visitor.visitFnCall(this);
  }
}

class Visitor {
  visit(node) {
    return node.accept(this);
  }

  visitBinOp(node) {
    throw new Error('Unimplemented');
  }

  visitNum(node) {
    throw new Error('Unimplemented');
  }

  visitUnaryOp(node) {
    throw new Error('Unimplemented');
  }

  visitVariable(node) {
    throw new Error('Unimplemented');
  }

  visitAssign(node) {
    throw new Error('Unimplemented');
  }

  visitFnDef(node) {
    throw new Error('Unimplemented');
  }

  visitFnCall(node) {
    throw new Error('Unimplemented');
  }
}

module.exports = { Visitor, Num, BinOp, UnaryOp, Var, Asgn, FnDef, FnCall };
