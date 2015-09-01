'use strict';
var evalCLJS = require('./cljs');

module.exports = function cljsToJs(resolve, reject, data) {

  evalCLJS(data.source, function(err, result) {
    var error = {};
    if (err) {
      var line = err.split('\n')[0];
      line.replace(/^Error: (.*), starting at line (\d+) and column (\d+)/, function (all, message, line, ch) {
        error.message = message;
        error.line = line * 1;
        error.ch = ch * 1;
      });
    }
    resolve({
      errors: err ? [{ line: error.line, ch: error.ch, msg: error.message }] : null,
      result: result || null,
    });
  });
};
