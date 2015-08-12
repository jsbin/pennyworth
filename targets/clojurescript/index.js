'use strict';
var evalCLJS = require('./cljs');

module.exports = function cljsToJs(resolve, reject, data) {

  evalCLJS(data.source, function(err, result) {
    resolve({
      errors: err ? [{ line: null, ch: null, msg: err.message }] : null,
      result: result
    });
  });
};
