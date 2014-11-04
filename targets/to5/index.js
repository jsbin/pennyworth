'use strict';
var to5 = require('6to5');

module.exports = function convert6to5(resolve, reject, data) {
  try {
    var result = to5.transform(data.source);
    resolve({
      errors: null,
      result: result.code
    });
  } catch (e) {
    console.log('failed 6to5');
    var errors = {
      line: e.loc.line - 1,
      ch: e.loc.column,
      msg: e.message
    };
    resolve({
      errors: [errors],
      result: null
    });
  }
};