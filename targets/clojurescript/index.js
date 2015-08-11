'use strict';
var evalCLJS = require('./cljs');

module.exports = function cljsToJs(resolve, reject, data) {
  try {
    evalCLJS(data.source, function(err, result) {
      resolve({
        errors: err || null,
        result: result || null
      });
    });
  } catch (e) {
    console.log('failed ClojureScript');
    resolve({
      errors: [e],
      result: null
    });
  }
};
