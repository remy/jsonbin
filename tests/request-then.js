const request = require('request');

module.exports = function makeRequest (options) {
  if (typeof options === 'string')
    options = {
      uri: options,
      method: 'GET'
    };

  return new Promise((resolve, reject) => {
    request(options, (error, response) => {
      if (error)
        reject(error);
      else
        resolve(response);
    });
  });
};

module.exports.defaults = request.defaults;
