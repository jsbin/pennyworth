var util = require('util');

var debug = !!process.env.VERBOSE;

var noop = function () {};

var logWithPrefix = function (prefix) {
  return function (msg) {
    util.log(prefix + ' ' + msg);
  };
};

var log = debug ? logWithPrefix('Log::') : noop;
log.error = debug ? logWithPrefix('Error::') : noop;

module.exports = log;
