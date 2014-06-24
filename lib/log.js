var debug = !!process.env.VERBOSE;

var noop = function () {};

var log = debug ? console.log.bind(console) : noop;
log.error = debug ? console.error.bind(console) : noop;

module.exports = log;
