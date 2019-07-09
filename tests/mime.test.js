const tap = require('tap');
const { setup, teardown, base, _request } = require('./utils');
const request = require('./request-then');
const test = require('tap-only');
const url = base + '/urls';
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

// reset the user store
tap.afterEach(done => {
  user.store = {
    urls: ['foo.com'],
  };
  user.dirty();
  user
    .save()
    .then(() => done())
    .catch(e => {
      console.log(e.stack);
      done(e);
    });
});

test(`json (error) 'bar.com'`, t => {
  return request({
    url,
    method: 'PATCH',
    body: 'bar.com',
    headers: getHeaders('application/json'),
  }).then(res => {
    t.equal(res.statusCode, 422, 'errors when invalid json sent');

    return request({
      url,
      json: true,
      headers: getHeaders('text/plain'),
    }).then(res => {
      t.deepEqual(res.body, ['foo.com'], 'body remained unchanged');
    });
  });
});
