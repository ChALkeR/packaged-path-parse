'use strict';

const tape = require('tape');
const impl = require('./path-parse-raw');
const es3impl = require('./index');
const tests = require('./tests');

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

tests.run(impl, tape);
tests.run(es3impl, tape, false);
