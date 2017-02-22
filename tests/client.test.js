const tap = require('tap');
const test = require('tap-only');
const { setup, teardown, request, base, _request } = require('./utils');
let user = null;

test('load user', t => {
  return setup({
    urls: ['foo.com']
  }).then(u => user = u).then(() => t.pass('user loaded'));
});

// reset the user store
tap.afterEach(done => {
  user.store = {
    urls: ['foo.com']
  };
  user.dirty();
  user.save().then(() => done());
});


tap.tearDown(() => {
  return teardown();
});

test('GET (cross origin)', t => {
  return _request({
    url: `${base}/urls`,
    json: true,
    headers: {
      authorization: `Bearer ${user.generateBearer('10s')}`
    }
  }).then(res => {
    t.deepEqual(res.body, ['foo.com'], `body matches: ${JSON.stringify(res.body)}`);
  });
});

test('GET (cross origin - expired token)', t => {
  const token = user.generateBearer('10ms');
  t.plan(1);
  setTimeout(() => {
    return _request({
      url: `${base}/urls`,
      json: true,
      headers: {
        authorization: `Bearer ${token}`
      }
    }).then(res => {
      t.deepEqual(res.body.status, 412, `expired token`);
    });
  }, 100);
});
