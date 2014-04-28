'use strict';
module.exports = function (origin) {
  return function (req, res, next) {
    var headers = req.header('Access-Control-Request-Headers');

    // TODO should this check if the request is via the API?
    if (req.method === 'OPTIONS' || (req.method === 'GET' && req.xhr) || (req.method === 'GET' && req.headers.origin)) {
      res.header({
        'Access-Control-Allow-Origin':  origin,
        'Access-Control-Allow-Headers': headers
      });
      req.cors = true;
    }

    if (req.method === 'OPTIONS') {
      res.send(204);
    } else {
      next();
    }
  };
};