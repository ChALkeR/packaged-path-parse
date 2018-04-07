// NOTE: this file only includes the tests, to run them, use 'test.js'

'use strict';

const path = require('path');
const fs = require('fs');
const equal = require('deep-equal');
const babylon = require('babylon');
const fun2str = (fun) => Function.prototype.toString.call(fun);

function *genOne(len, chars) {
  if (len === 0) {
    yield '';
    return;
  }
  for (const prefix of genOne(len - 1, chars)) {
    for (const c of chars) {
      yield `${prefix}${c}`;
    }
  }
}

function *gen(len, chars) {
  for (let i = 0; i <= len; i++) {
    yield *genOne(i, chars);
  }
}

function run(impl, test, sourceExact) {
  const current = process.version === impl.version;
  const implwrap = {
    parse: impl,
    win32: { parse: impl.win32 },
    posix: { parse: impl.posix },
  };

  test('is a function', (t) => {
    t.equal(typeof impl, 'function');
    t.end();
  });
  test('all properties exist', (t) => {
    const props = ['win32', 'posix', 'version'];
    for (const name of props) {
      t.notEqual(typeof impl[name], 'undefined');
    }
    t.deepEqual(Object.keys(impl), props);
    t.end();
  });
  test('equal to current version', (t) => {
    let check = process.version === impl.version;
    if (sourceExact === false) {
      // Skip is requested manually, do nothing here
    } else if (current || sourceExact === true) {
      t.equal(process.version, impl.version);
      t.equal(fun2str(impl), fun2str(path.parse));
      t.equal(fun2str(impl.win32), fun2str(path.win32.parse));
      t.equal(fun2str(impl.posix), fun2str(path.posix.parse));
    } else {
      t.skip(
        'Current Node.js version is not equal to path.parse version, ' +
        'skipping source equality test.'
      );
    }
    t.end();
  });
  test('throws on non-strings', (t) => {
    for (const arg of [0, {}, /x/, NaN, null, undefined, new String('x')]) {
      t.throws(() => impl(arg));
      t.throws(() => impl.win32(arg));
      t.throws(() => impl.posix(arg));
    }
    t.end();
  });
  test('does not throw on strings', (t) => {
    for (const arg of ['', 'a', String('x')]) {
      t.doesNotThrow(() => impl(arg));
      t.doesNotThrow(() => impl.win32(arg));
      t.doesNotThrow(() => impl.posix(arg));
    }
    t.end();
  });
  test('is either win32 or posix, and is the correct one', (t) => {
    t.ok(impl.win32 !== impl.posix);
    t.ok(impl === impl.win32 || impl === impl.posix);
    t.ok(
      impl === impl.win32 && path === path.win32 ||
      impl === impl.posix && path === path.posix
    );
    t.end();
  });
  test('identical result on short strings', (t) => {
    if (current) {
      for (const arg of gen(1, 'a/\\.:?')) {
        t.deepEqual(impl(arg), path.parse(arg), arg);
        t.deepEqual(impl.win32(arg), path.win32.parse(arg), arg);
        t.deepEqual(impl.posix(arg), path.posix.parse(arg), arg);
      }
    } else {
      t.skip(
        'Current Node.js version is not equal to path.parse version, ' +
        'skipping short identical results test.'
      );
    }
    t.end();
  });
  test('identical result on long strings', (t) => {
    if (current) {
      let ok = true;
      for (const arg of gen(6, 'AaZz \t/\\.|:?')) {
        if (
          !equal(impl.win32(arg), path.win32.parse(arg)) ||
          !equal(impl.posix(arg), path.posix.parse(arg))
        ) {
          ok = false;
          t.fail(arg);
        }
      }
      t.ok(ok);
    } else {
      t.skip(
        'Current Node.js version is not equal to path.parse version, ' +
        'skipping long identical results test.'
      );
    }
    t.end();
  });
  test('Identical results on Node.js test strings', (t) => {
    // Ok, let's just extract all the strings from Node.js test and ensure
    // that the behavior is identical!
    const source = fs
      .readFileSync('./node/test/test-path-parse-format.js', 'utf-8');
    const tokens = babylon.parse(source, { tokens: true }).tokens;
    const strings = tokens
      .filter(token => token.type.label === 'string')
      .map(token => token.value);
    const uniq = [...new Set(strings)];
    t.ok(uniq.length > 10);
    if (current) {
      for (const arg of uniq) {
        t.deepEqual(impl(arg), path.parse(arg), arg);
        t.deepEqual(impl.win32(arg), path.win32.parse(arg), arg);
        t.deepEqual(impl.posix(arg), path.posix.parse(arg), arg);
      }
    } else {
      t.skip(
        'Current Node.js version is not equal to path.parse version, ' +
        'skipping test strings identical results test.'
      );
    }
    t.end();
  });
  test('Node.js tests execution', (t) => {
    const source = fs
      .readFileSync('./node/test/test-path-parse-format.js', 'utf-8')
      .replace(/assert\(/, 'assert.ok(')
      .replace(/\nfunction checkFormat\([\s\S]*?\n}/, '')
      .replace(/\nconst expectedMessage[\s\S]*?\);\n/, '')
      .replace(/, message: expectedMessage/g, '')
      .replace(/, errorCase.message/g, '')
      .replace(/.*\.format.*/g, '')
      .replace(/.*\.(dir|base|ext)name\(.*/g, '')
      .replace(/.*checkFormat.*/g, '')
      .replace(/.*require\(.*/g, '');
    const fun = new Function('path', 'assert', source);
    fun(implwrap, t);
    t.end();
  });
}

module.exports = { run };
