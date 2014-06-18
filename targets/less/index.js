var less = require('less');

var convertToLess = function (resolve, reject, data) {
  console.log('about to render some shit');
  less.render(data.source, function (error, css) {
    console.log(error, css);
    if (error) {
      reject(error);
    }
    resolve(css);
  });
};

module.exports = convertToLess;
