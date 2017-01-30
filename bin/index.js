const Request = require('request');

module.exports = init;

function init(token = process.env.JSONBIN_TOKEN) {
  if (!token) {
    throw new Error('jsonbin.org API token required');
  }
  return new JsonBin(token);
}

class JsonBin {
  constructor(token) {
    this.token = token;
    const request = Request.defaults({
      baseUrl: 'https://jsonbin.org/me',
      headers: {
        authorization: `token ${token}`
      },
      json: true,
    });

    this.request = (opts) => {
      return new Promise((resolve, reject) => {
        request(opts, (err, res, body) => {
          if (err) {
            return reject(err);
          }

          if (res.statusCode > 299) {;
            return reject(new Error(res.statusCode));
          }

          resolve(body);
        });
      });
    }
  }

  get(url) {
    return this.request({ url });
  }

  del(url) {
    return this.request({ url, method: 'delete' });
  }

  set(url, body) {
    return this.request({
      method: 'post',
      url,
      body,
    })
  }
}
