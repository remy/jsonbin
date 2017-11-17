const parse = require('querystring').parse;
const resolveURL = require('url').resolve;
const highlight = require('cli-highlight').highlight;
const request = require('request');
const host =
  process.env.HOST || process.env.JSONBIN_HOST || 'https://jsonbin.org';

module.exports = (args, settings, body) => {
  const token = args.token || process.env.JSONBIN_TOKEN;

  if (!token) {
    throw new Error(
      'You must include your API key. See jsonbin --help for details.'
    );
  }

  if (args.argv.slice(2).length === 0) {
    args.argv.push('.');
  }

  return Promise.all(
    args.argv
      .slice(2)
      .map(_ => {
        let value = false;
        let json = false;
        return {
          data: parse(_, null, null, {
            decodeURIComponent: s => {
              if (value) {
                if ((s === '-' || s === '"-"') && body) {
                  s = body;
                }
                try {
                  // try to transform it to JSON
                  const f = new Function('return ' + (s || 'null'));
                  s = JSON.stringify(f());
                  json = true;
                } catch (e) {}
              }
              value = true;
              return s;
            },
          }),
          // super important that this value is last as it's
          // interpreted *after* the above function runs
          json,
        };
      })
      .map(kv => {
        return new Promise((resolve, reject) => {
          let json = kv.json;
          const [key, body] = Object.entries(kv.data)[0];
          const post = body !== '' && body !== 'null'; // yes, I meant string
          let path = key.split('.').join('/');

          let method = post ? 'POST' : 'GET';

          if (args.delete) {
            method = 'DELETE';
          }

          if (args.append) {
            method = 'PATCH';
          }

          if (method !== 'GET' && path === '/') {
            return reject(new Error(`Cannot ${method} root of JSON store`));
          }

          if (method === 'GET') {
            json = true;
          }

          if (path.startsWith('/')) {
            path = path.slice(1);
          }

          request(
            {
              url: resolveURL(host + '/me/', path),
              method,
              body: body && json ? JSON.parse(body) : body,
              json,
              headers: {
                authorization: `token ${token}`,
              },
            },
            (err, res, body) => {
              if (res.statusCode > 201) {
                reject(new Error(JSON.stringify(body)));
              } else {
                resolve(body);
              }
            }
          );
        });
      })
  ).then(res => {
    if (res.length === 1) {
      res = res[0];
    }

    if (typeof res === 'string') {
      return res;
    }

    res = JSON.stringify(res, '', 2);

    if (process.stdout.isTTY) {
      // if not being piped
      return highlight(res, { language: 'json' });
    }

    return res;
  });
};
