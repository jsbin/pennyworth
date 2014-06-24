'use strict';
var less = require('less');

var convertToLess = function (resolve, reject, data) {
  less.render(data.source, function (error, css) {
    if (error) {
      var errors = {
        line: error.line,
        ch: error.column,
        msg: error.message
      };
      resolve({
        errors: [errors],
        result: null
      });
    }
    var res = css;
    resolve({
      errors: null,
      result: res
    });
  });
};

module.exports = convertToLess;
