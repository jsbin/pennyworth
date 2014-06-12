var coffeescript = require('coffee-script');

var convertToCoffeeScript = function (resolve, reject, data) {
  try {
    resolve(coffeescript.compile(data.source));
  } catch (e) {
    reject(e);
  }
};

module.exports = convertToCoffeeScript;
