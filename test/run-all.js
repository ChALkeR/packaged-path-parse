'use strict';

const tape = require('tape');
const fs = require('fs');
const impl = require('../path-parse-raw');
const es3impl = require('../index');

function read(file) {
  return fs.readFileSync(file, 'utf-8');
}

const versionRe = /extracted from Node.js ([^\n]+)\n/;
const implVer = read('./path-parse-raw.js', 'utf-8').match(versionRe)[1];
const es3implVer = read('./index.js', 'utf-8').match(versionRe)[1];

tape('normal and es3 versions match', (t) => {
  t.strictEqual(implVer, es3implVer);
  t.equal(typeof implVer, 'string');
  t.equal(typeof es3implVer, 'string');
  t.ok(implVer.length >= 6);
  t.ok(es3implVer.length >= 6);
  t.strictEqual(implVer[0], 'v');
  t.strictEqual(es3implVer[0], 'v');
  t.end();
});

var tests = ['./simple', './complex'];

for (const test of tests) {
  const lib = require(test)
  lib.run(impl, tape, process.version === implVer, true);
  lib.run(es3impl, tape, process.version === implVer, false);
}
