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

function read(file) {
  return fs.readFileSync(file, 'utf-8');
}

function teststrings() {
  const source = read('./node/test/test-path-parse-format.js');
  const tokens = babylon.parse(source, { tokens: true }).tokens;
  const strings = tokens
    .filter(token => token.type.label === 'string')
    .map(token => token.value);
  [ '///xxx',
    'C:\\abc\\def',
    'http://example/com/?foo=bar&foo#baz'
  ].forEach(string => strings.push(string));
  const uniq = [...new Set(strings)];
  return uniq;
}

function run(impl, test, sourceExact) {
  const current = process.version === impl.version;
  const implwrap = {
    parse: impl,
    win32: { parse: impl.win32 },
    posix: { parse: impl.posix },
  };

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
  test('identical result on short strings', (t) => {
    if (current) {
      for (const arg of gen(1, 'a/\\.:?')) {
        const label = JSON.stringify(arg);
        t.deepEqual(impl(arg), path.parse(arg), `default ${label}`);
        t.deepEqual(impl.win32(arg), path.win32.parse(arg), `win32 ${label}`);
        t.deepEqual(impl.posix(arg), path.posix.parse(arg), `posix ${label}`);
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
    const strings = teststrings();
    t.ok(strings.length > 10);
    if (current) {
      for (const arg of strings) {
        const label = JSON.stringify(arg);
        t.deepEqual(impl(arg), path.parse(arg), `default ${label}`);
        t.deepEqual(impl.win32(arg), path.win32.parse(arg), `win32 ${label}`);
        t.deepEqual(impl.posix(arg), path.posix.parse(arg), `posix ${label}`);
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
    const source = read('./node/test/test-path-parse-format.js')
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

module.exports = { teststrings, run };