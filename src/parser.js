const { TokenType } = require('./token');
const {
  BinOp,
  Num,
  UnaryOp,
  Var,
  Asgn,
  FnDef,
  FnCall,
  Visitor,
} = require('./tree');
const { Tokenizer } = require('./tokenizer');

class Parser {
  constructor(fnDefs = new Map()) {
    this._fnDefs = fnDefs;
    this._tokenizer = null;
    this._token = null;
  }

  parse(expr) {
    this._tokenizer = new Tokenizer(expr);
    this._token = this._tokenizer.getNextToken();

    const result = this._parse();

    if (!this._isToken(TokenType.EOF)) {
      this._throwError();
    }

    return result;
  }

  _parse() {
    if (this._isToken(TokenType.EOF)) {
      return null;
    }

    if (this._isToken(TokenType.FNKEY)) {
      return this._parseFnDef();
    }

    return this._parseExpr();
  }

  _parseFnDef() {
    this._advance(TokenType.FNKEY);
    const fnName = this._advance(TokenType.ID);
    const args = [];

    while (!this._isToken(TokenType.FNOP)) {
      const { value } = this._advance(TokenType.ID);

      if (args.includes(value)) {
        this._throwError();
      }

      args.push(value);
    }

    this._advance(TokenType.FNOP);
    const body = this._parseExpr();

    new FnBodyValidator(args).visit(body);

    return new FnDef(fnName.value, args, body);
  }

  _parseExpr() {
    const term = this._term();

    if (this._isToken(TokenType.ASGN)) {
      return this._parseAssignment(term);
    }

    if (this._isToken([TokenType.PLUS, TokenType.MINUS])) {
      return this._parseAddition(term);
    }

    return term;
  }

  _parseAssignment(left) {
    if (left instanceof Var && this._isToken(TokenType.ASGN)) {
      return new Asgn(this._advance().value, left, this._parseExpr());
    }

    this._throwError();
  }

  _parseAddition(term) {
    let result = term;

    while (this._isToken([TokenType.PLUS, TokenType.MINUS])) {
      result = new BinOp(this._advance().value, result, this._term());
    }

    return result;
  }

  _term() {
    let result = this._factor();

    while (this._isToken([TokenType.MUL, TokenType.DIV, TokenType.MOD])) {
      result = new BinOp(this._advance().value, result, this._factor());
    }

    return result;
  }

  _factor() {
    if (this._isToken(TokenType.NUM)) {
      return new Num(this._advance().value);
    }

    if (this._isToken(TokenType.LPAR)) {
      return this._parseParenthesis();
    }

    if (this._isToken([TokenType.PLUS, TokenType.MINUS])) {
      return new UnaryOp(this._advance().value, this._factor());
    }

    if (this._isToken(TokenType.FNCALL)) {
      return this._parseFnCall();
    }

    if (this._isToken(TokenType.ID)) {
      return new Var(this._advance().value);
    }

    this._throwError();
  }

  _parseParenthesis() {
    this._advance(TokenType.LPAR);
    const node = this._parseExpr();
    this._advance(TokenType.RPAR);

    return node;
  }

  _parseFnCall() {
    const { value } = this._advance(TokenType.ID);
    const formalArgs = this._fnDefs.get(value).args;
    const actualArgs = [];

    while (
      this._isToken([TokenType.NUM, TokenType.LPAR, TokenType.ID]) &&
      actualArgs.length < formalArgs.length
    ) {
      actualArgs.push(this._parseExpr());
    }

    if (actualArgs.length !== formalArgs.length) {
      this._throwError();
    }

    return new FnCall(value, actualArgs);
  }

  _advance(types) {
    const { _token } = this;

    if (!this._isToken(types)) {
      this._throwError();
    }

    this._token = this._tokenizer.getNextToken();

    return _token;
  }

  _isToken(types) {
    if (null == types) {
      return true;
    }

    if (!Array.isArray(types)) {
      types = [types];
    }

    return types.some((type) => {
      if (TokenType.FNCALL === type) {
        return (
          TokenType.ID === this._token.type &&
          this._fnDefs.has(this._token.value)
        );
      }

      return type === this._token.type;
    });
  }

  _throwError() {
    throw new Error('Parsing error');
  }
}

class FnBodyValidator extends Visitor {
  constructor(formalArgs) {
    super();
    this._formalArgs = formalArgs;
  }

  visitNum() {}

  visitFnDef() {}

  visitBinOp({ left, right }) {
    this.visit(left);
    this.visit(right);
  }

  visitUnaryOp({ right }) {
    return this.visit(right);
  }

  visitVariable({ name }) {
    if (!this._formalArgs.includes(name)) {
      throw new Error(`Unknown identifier '${name}'`);
    }
  }

  visitAssign({ left, right }) {
    this.visit(left);
    this.visit(right);
  }

  visitFnCall({ args }) {
    args.forEach((arg) => this.visit(arg));
  }
}

module.exports = { Parser };
