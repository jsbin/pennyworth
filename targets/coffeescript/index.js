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
    // index starts at 0
    var errors = {
      line: parseInt(e.location.first_line, 10) || 0,
      ch: parseInt(e.location.first_column, 10) || 0,
      msg: e.message
    };
    resolve({
      errors: [errors],
      result: null
    });
  }
};

module.exports = convertToCoffeeScript;
