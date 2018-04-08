'use strict';

const tape = require('tape');
const fs = require('fs');
const impl = require('../index');

const versionRe = /extracted from Node.js ([^\n]+)\n/;
const implVer = fs.readFileSync('./index.js', 'utf-8').match(versionRe)[1];

tape('version is fine', (t) => {
  t.equal(typeof implVer, 'string');
  t.ok(implVer.length >= 6);
  t.strictEqual(implVer[0], 'v');
  t.strictEqual(implVer.split('.').length, 3);
  t.end();
});

const tests = ['./simple', './complex'];

for (const test of tests) {
  const lib = require(test);
  lib.run(impl, tape, process.version === implVer);
}
