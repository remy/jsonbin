const request = require('request');

module.exports = function makeRequest(options) {
  if (typeof options === 'string')
    options = {
      url: options,
      method: 'GET',
    };

  let curl = `curl -i -X ${(options.method || 'get').toUpperCase()} "${
    options.url
  }"`;
  const s = ' \\\n         ';

  if (options.headers) {
    Object.keys(options.headers).forEach(k => {
      curl += `${s}-H "${k}: ${options.headers[k]}"`;
    });
  }

  if (options.json) {
    curl += `${s}-H "content-type:application/json"`;
  }

  if (options.body) {
    curl += `${s}-d '${JSON.stringify(options.body)}'`;
  }

  // console.log(curl);

  return new Promise((resolve, reject) => {
    request(options, (error, response) => {
      if (error) reject(error);
      else resolve(response);
    });
  });
};

module.exports.defaults = request.defaults;
