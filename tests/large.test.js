const tap = require('tap');
const { setup, teardown, base, _request } = require('./utils');
const request = require('./request-then');
const test = require('tap-only');
const url = base + '/large';
let user = null;

function getHeaders(type) {
  const h = {
    authorization: `token ${user.apikey}`,
  };

  if (type) {
    h['content-type'] = type;
  }

  return h;
}

test('load user', t => {
  return setup({
    urls: ['foo.com'],
  })
    .then(u => (user = u))
    .then(() => t.pass('user loaded'));
});

tap.tearDown(() => {
  return teardown();
});

test(`large json is disallowed'`, t => {
  t.plan(2);
  return request({
    url,
    method: 'POST',
    body: `{ "data": "${'a'.repeat(1000001)}" }`,
    headers: getHeaders('application/json'),
  }).then(res => {
    t.equal(res.statusCode, 201, 'content accepted');

    return request({
      url,
      json: true,
      headers: getHeaders('text/plain'),
    }).then(res => {
      t.notEqual(res.statusCode, 200, 'request is denied');
    });
  });
});
