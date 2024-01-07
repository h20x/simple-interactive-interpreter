const { Token, TokenType } = require('./token');

class Tokenizer {
  constructor(input) {
    this._input = input;
    this._index = 0;
  }

  get _char() {
    return this._isEnd() ? null : this._input[this._index];
  }

  getNextToken() {
    this._skipWS();

    if (this._isEnd()) {
      return new Token(TokenType.EOF, null);
    }

    if (isNum(this._char)) {
      let num = this._readInt();

      if ('.' === this._char) {
        num += this._advance();

        if (!isNum(this._char)) {
          this._throwError();
        }

        num += this._readInt();
      }

      return new Token(TokenType.NUM, Number(num));
    }

    if (isLetter(this._char)) {
      const identifier = this._readIdentifier();
      const type = 'fn' === identifier ? TokenType.FNKEY : TokenType.ID;

      return new Token(type, identifier);
    }

    if ('+' === this._char) {
      return new Token(TokenType.PLUS, this._advance());
    }

    if ('-' === this._char) {
      return new Token(TokenType.MINUS, this._advance());
    }

    if ('*' === this._char) {
      return new Token(TokenType.MUL, this._advance());
    }

    if ('/' === this._char) {
      return new Token(TokenType.DIV, this._advance());
    }

    if ('%' === this._char) {
      return new Token(TokenType.MOD, this._advance());
    }

    if ('(' === this._char) {
      return new Token(TokenType.LPAR, this._advance());
    }

    if (')' === this._char) {
      return new Token(TokenType.RPAR, this._advance());
    }

    if ('=' === this._char) {
      let val = this._advance();
      let type = TokenType.ASGN;

      if ('>' === this._char) {
        val += this._advance();
        type = TokenType.FNOP;
      }

      return new Token(type, val);
    }

    this._throwError();
  }

  _readInt() {
    let val = '';

    while (isNum(this._char)) {
      val += this._advance();
    }

    return val;
  }

  _readIdentifier() {
    let name = '';

    while (isAlNum(this._char)) {
      name += this._advance();
    }

    return name;
  }

  _skipWS() {
    while (' ' === this._char) {
      this._advance();
    }
  }

  _advance() {
    const result = this._char;

    if (!this._isEnd()) {
      this._index++;
    }

    return result;
  }

  _isEnd() {
    return this._index >= this._input.length;
  }

  _throwError() {
    throw new Error('Unexpected character');
  }
}

function isNum(ch) {
  return ch && /[0-9]/.test(ch);
}

function isLetter(ch) {
  return ch && /[_a-zA-Z]/.test(ch);
}

function isAlNum(ch) {
  return isLetter(ch) || isNum(ch);
}

module.exports = { Tokenizer };
