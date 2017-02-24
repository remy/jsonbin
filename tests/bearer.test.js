const tap = require('tap');
const test = require('tap-only');
const { setup, teardown, request, base, _request } = require('./utils');
let user = null;

test('load user', t => {
  return setup({
    urls: ['foo.com', 'bar.com']
  }).then(u => user = u).then(() => t.pass('user loaded'));
});

// reset the user store
tap.afterEach(done => {
  user.store = {
    urls: ['foo.com', 'bar.com']
  };
  user.dirty();
  user.save().then(() => done());
});


tap.tearDown(() => {
  return teardown();
});

test('GET (cross origin)', t => {
  const token = user.generateBearer({ expiresIn: '10s', path: 'urls.0' });
  const opts = {
    url: `${base}/urls/0`,
    json: true,
    headers: {
      authorization: `Bearer ${token}`
    }
  };

  return _request(opts).then(res => {
    t.equal(res.body, 'foo.com', `body matches: ${JSON.stringify(res.body)}`);

    return _request(Object.assign({}, opts, { url: `${base}/urls/1` })).then(res => {
      t.equal(res.body, null, `body matches: ${JSON.stringify(res.body)}`);
      t.equal(res.statusCode, 401, `status ${res.statusCode}`);
    })
  });
});

test('GET (cross origin - expired token)', t => {
  const token = user.generateBearer({ expiresIn: '10ms' });
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
