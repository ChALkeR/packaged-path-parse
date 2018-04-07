'use strict';

var tape = require('tape');
var es3impl = require('../index');
var lib = require('./simple')
lib.run(es3impl, tape, false);
