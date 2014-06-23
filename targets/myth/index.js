'use strict';
var myth = require('myth');

module.exports = function convertMyth(resolve, reject, data) {
  try {
    resolve(myth(data.source));
  } catch (e) {
    reject(e);
  }
};