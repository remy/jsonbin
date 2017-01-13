const parse = require('querystring').parse;
const resolveURL = require('url').resolve;
const request = require('request');
module.exports = (_args, settings, body) => {
  const token = _args.token || process.env.JSONBIN_TOKEN;

  if (!token) {
    throw new Error('You must include your API key. See jsonbin --help for details.');
  }

  return Promise.all(
    _args.argv.slice(2).map(_ => {
      let key = false;
      let json = false;
      return {
        data: parse(_, null, null, {
          decodeURIComponent: s => {
            if (key) {
              // try to transform it to JSON
              const f = new Function('return ' + (s || 'null'));
              try {
                s = JSON.stringify(f());
                json = true;
              } catch (e) {
              };
            }
            key = true;
            if (s === '-' && body) {
              return body;
            }
            return s;
          }
        }),
        // super important that this value is last as it's
        // interpretted *after* the above function runs
        json,
      };
    }).map(kv => {
      return new Promise((resolve, reject) => {
        const json = kv.json;
        const [key, body] = Object.entries(kv.data)[0];
        const post = body !== '' && body !== 'null'; // yes, I meant string
        let path = key.split('.').join('/');

        let method = post ? 'POST' : 'GET';

        if (_args.delete) {
          method = 'DELETE';
        }

        if (_args.append) {
          method = 'PATCH';
        }

        if (method !== 'GET' && path === '/') {
          return reject(new Error(`Cannot ${method} root of JSON store`));
        }

        if (path.startsWith('/')) {
          path = path.slice(1);
        }

        request({
          url: resolveURL('https://jsonbin.org/me/', path),
          method,
          body: json ? JSON.parse(body) : body,
          json,
          headers: {
            authorization: `token ${token}`
          }
        }, (err, res, body) => {
          if (res.statusCode > 201) {
            reject(new Error(`${res.statusCode}: ${path}\n${body}`));
          } else {
            resolve(body);
          }
        });
      });
    })
  );
};
