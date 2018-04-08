'use strict';

var test;
try {
  test = require('tape');
} catch (e) {
  var assert = require('assert');
  var keys = Object.keys(assert);
  var t = {};
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    t[key] = assert[key];
  }
  t.end = function() {};
  t.deepEqual = t.deepStrictEqual || t.deepEqual;
  test = function(name, run) { run(t); };
}

var impl = require('../index');
var lib = require('./simple');

lib.run(impl, test, false);
