'use strict';

/*
 * A builder helper.
 * 
 * WARNING: this works on specific versions and is just a handy tool to reduce
 * manual errors. The results of this have to be re-checked, and it is expected
 * that this tool will fail to import code from newer Node.js versions.
 *
 * It is also expected to be run on the same Node.js version that you are
 * extracting the code from and performs a check for that.
 *
 * The result, if passes, does not depend on the Node.js version this is ran on.
 */

// This is too simple and could be fragile (though it will be noticed in checks)
// TODO: use AST instead?

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const babel = require('babel-core');
const testsSimple = require('./test/simple');
const testsComplex = require('./test/complex');
const { version } = require('./package.json');

if (`v${version}` !== process.version) {
  console.error(
    'Error:\n Please run this on the same Node.js version that you took the ' +
    'sources from!\n The sources version should be put in package.json.\n' +
    ` Node.js version: ${process.version}.\n Package version: v${version}.`
  );
  throw new Error('Node.js version mismatch');
}

const fun2str = (fun) => Function.prototype.toString.call(fun);

function generateTestdata() {
  const strings = testsComplex.teststrings();
  const res = [];
  for (const string of strings) {
    for (const type of ['win32', 'posix']) {
      res.push({ type, string, result: path[type].parse(string) });
    }
  }
  return res;
}

function functionRe(name) {
  return new RegExp(`(\\n+//.*)?\\nfunction ${name}\\([\\s\\S]*?\\n}\\n+`);
}

function build() {
  const constants = require('./node/internal/constants');
  const constantsStr = JSON.stringify(constants, undefined, 2);
  const source = fs.readFileSync('node/path.js', 'utf-8')
    .replace(/errors\.TypeError/g, 'TypeError')
    .replace(functionRe('normalizeString'), '\n')
    .replace(functionRe('_format'), '\n')
    .replace(functionRe('isPosixPathSeparator'), '\n')
    .replace("const errors = require('internal/errors');", '')
    .replace(/const {((?:\s*[A-Z_]+,\n)+)} = require\('internal\/constants'\);/,
      (...match) => {
        const names = match[1].split(',').map(x => x.trim()).filter(x => x);
        for (const name of names) {
          assert.ok(constants[name] !== 'undefined');
        }
        return names.map(name => `const ${name} = ${constants[name]};`).join('\n');
      }
    )
    .replace("require('internal/constants')", constantsStr);
  const head = source.replace(/const (win32|posix) = {[\s\S]*/m, '');
  const obj = new Function(`const module = {};${source};return module.exports`)();
  const win32 = fun2str(obj.win32.parse);
  const posix = fun2str(obj.posix.parse);

  // Assert that the version we are building equals to the one we are running on
  assert.equal(win32, fun2str(path.win32.parse));
  assert.equal(posix, fun2str(path.posix.parse));

  const code = `
// packaged-path-parse - path.parse() extracted from Node.js v${version}

'use strict';
const pathParse = (function(){
${head}
const win32 = ${win32};
const posix = ${posix};
const proc = typeof process === 'undefined' ? {} : process;
const pathParse = (proc.platform === 'win32') ? win32 : posix;
pathParse.win32 = win32;
pathParse.posix = posix;
return pathParse;
}());
if (typeof module !== 'undefined') module.exports = pathParse;
  `.trim();

  return `${code}\n`;
}

function verify(code, sourceExact) {
  const funCode = code.replace(
    /.*module.exports = pathParse;/,
    'return pathParse;'
  );
  const obj = new Function(funCode)();
  // Assert that the code loads and returns a function
  assert.equal(typeof obj, 'function');
  if (sourceExact) {
    // Assert the functons are the same
    assert.equal(fun2str(obj.win32), fun2str(path.win32.parse));
    assert.equal(fun2str(obj.posix), fun2str(path.posix.parse));
  }
  // Assert that the code doesn't use anything we don't want or expect
  for (const text of [
    'normalizeString', '_format', 'isPosixPathSeparator',
    'module.exports', 'require', 'internals/',
    'constants.', 'process.', 'errors.'
  ]) {
    assert.equal(funCode.includes(text), false);
  }

  // Let's now run tests on top of assert instead of tape
  const test = {...assert};
  test.end = () => {};
  test.deepEqual = test.deepStrictEqual;
  testsSimple.run(obj, (name, run) => run(test));
  testsComplex.run(obj, (name, run) => run(test), true, sourceExact);
}

console.log('Generating testdata...');
const testdata = generateTestdata();
fs.writeFileSync('test/data.json', JSON.stringify(testdata, undefined, 2));
console.log('Testdata written.');


console.log('Building...');
const code = build();
console.log('Build complete, verifying...');
verify(code, true);
console.log('Verification complete');

console.log('Transpliting...');
const es3code = babel.transform(code,
  JSON.parse(fs.readFileSync('.babelrc', 'utf-8'))
).code;
console.log('Transpliting complete, verifying...');
verify(es3code, false);
console.log('Verification complete');

if (process.argv[2] === 'check') {
  console.log('Checking file equality...');
  assert.equal(fs.readFileSync('index.js', 'utf-8'), es3code);
} else {
  console.log('Writing file...');
  fs.writeFileSync('index.js', es3code);
}
console.log('Done!');
