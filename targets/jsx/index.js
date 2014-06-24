'use strict';

var jsx = require('./JSXTransformer');

module.exports = function (resolve, reject, data) {
  try {
    var res = jsx.transform(data.source).code;
    resolve({
      errors: null,
      result: res
    });
  } catch (e) {
    var errors = {
      line: e.lineNumber,
      ch: e.column,
      msg: e.description
    };
    resolve({
      errors: [errors],
      result: null
    });
  }
};