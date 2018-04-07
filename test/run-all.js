'use strict';

var tape = require('tape');
var impl = require('../path-parse-raw');
var es3impl = require('../index');

tape('normal and es3 versions match', (t) => {
  t.strictEqual(impl.version, es3impl.version);
  t.equal(typeof impl.version, 'string');
  t.equal(typeof es3impl.version, 'string');
  t.ok(impl.version.length >= 6);
  t.ok(es3impl.version.length >= 6);
  t.strictEqual(impl.version[0], 'v');
  t.strictEqual(es3impl.version[0], 'v');
  t.end();
});

var tests = ['./simple', './complex'];

for (const test of tests) {
  const lib = require(test)
  lib.run(impl, tape);
  lib.run(es3impl, tape, false);
}
