'use strict';

var jsx = require('./JSXTransformer');

module.exports = function (resolve, reject, data) {
  try {
    resolve(jsx.transform(data.source).code);
  } catch (e) {
    reject(e);
  }
};