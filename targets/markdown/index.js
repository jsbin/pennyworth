'use strict';

var markdown = require('markdown').markdown;

module.exports = function (resolve, reject, data) {
  try {
    resolve(markdown.toHTML(data.source));
  } catch (e) {
    reject(e);
  }
};