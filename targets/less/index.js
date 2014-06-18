var less = require('less');

var convertToLess = function (resolve, reject, data) {
  less.render(data.source, function (error, css) {
    if (error) {
      reject(error);
    }
    resolve(css);
  });
};

module.exports = convertToLess;
