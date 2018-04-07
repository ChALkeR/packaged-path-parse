'use strict';

var path = require('path');
var fs = require('fs');
var equal = require('deep-equal');

function read(file) {
  return fs.readFileSync(file, 'utf-8');
}

function run(impl, test, sourceExact) {
  test('is a function', function (t) {
    t.equal(typeof impl, 'function');
    t.end();
  });
  test('all properties exist', function (t) {
    var props = ['win32', 'posix', 'version'];
    for (var i = 0; i < props.length; i++) {
      var name = props[i];
      t.notEqual(typeof impl[name], 'undefined');
    }
    t.deepEqual(Object.keys(impl), props);
    t.end();
  });
  test('throws on non-strings', function (t) {
    var strings = [0, {}, /x/, NaN, null, undefined, new String('x')];
    for (var i = 0; i < strings.length; i++) {
      var arg = strings[i];
      t.throws(function() { impl(arg); });
      t.throws(function() { impl.win32(arg); });
      t.throws(function() { impl.posix(arg); });
    }
    t.end();
  });
  test('does not throw on strings', function (t) {
    var strings = ['', 'a', String('x')];
    for (var i = 0; i < strings.length; i++) {
      var arg = strings[i];
      t.doesNotThrow(function() { impl(arg); });
      t.doesNotThrow(function() { impl.win32(arg); });
      t.doesNotThrow(function() { impl.posix(arg); });
    }
    t.end();
  });
  test('is either win32 or posix, and is the correct one', function (t) {
    t.ok(impl.win32 !== impl.posix);
    t.ok(impl === impl.win32 || impl === impl.posix);
    t.ok(
      impl === impl.win32 && path === path.win32 ||
      impl === impl.posix && path === path.posix
    );
    t.end();
  });
  test('expected results on testdata', function (t) {
    var entries = JSON.parse(read('./test/data.json'));
    for (var i = 0; i < entries.length; i++) {
      var string = entries[i].string;
      var type = entries[i].type;
      var result = entries[i].result;
      var label = type + ' ' + JSON.stringify(string);
      t.deepEqual(impl[type](string), result, label);
    }
    t.end();
  });
}

module.exports = { run: run };