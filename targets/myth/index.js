'use strict';
var myth = require('myth');

module.exports = function convertMyth(resolve, reject, data) {
  try {
    var res = myth(data.source);
    resolve({
      errors: null,
      result: res
    });
  } catch (e) {
    var errors = {
      line: e.line,
      ch: e.column,
      msg: e.message
    };
    resolve({
      errors: [errors],
      result: null
    });
  }
};