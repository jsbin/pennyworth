var debug = !!process.env.NOLOG ? false : true;
var noop = function () {};

var log = debug ? console.log.bind(console) : noop;
log.error = debug ? console.error.bind(console) : noop;

module.exports = log;
