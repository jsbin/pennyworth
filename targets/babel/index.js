'use strict';
var babel = require('babel-core');

module.exports = function convertbabel(resolve, reject, data) {
  try {
    var result = babel.transform(data.source, {
      stage: 0
    });
    resolve({
      errors: null,
      result: result.code
    });
  } catch (e) {
    console.log('failed babel');
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
