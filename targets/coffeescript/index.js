'use strict';
var coffeescript = require('coffee-script');

var convertToCoffeeScript = function (resolve, reject, data) {
  try {
    var res = coffeescript.compile(data.source);
    resolve({
      errors: null,
      result: res
    });
  } catch (e) {
    var errors = {
      line: e.location.first_line,
      ch: e.location.first_column,
      msg: e.message
    };
    resolve({
      errors: [errors],
      result: null
    });
  }
};

module.exports = convertToCoffeeScript;
