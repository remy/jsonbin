const tap = require('tap');
const { setup, teardown, base, _request } = require('./utils');
const request = require('./request-then');
const test = tap.test;
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
};

test('load user', t => {
  return setup({
    urls: ['foo.com']
  }).then(u => user = u).then(() => t.pass('user loaded'));
});

tap.tearDown(() => {
  return teardown();
});

// reset the user store
tap.afterEach(done => {
  user.store = {
    urls: ['foo.com']
  };
  user.markModified('store');
  user.save().then(() => done());
});

test('x-www-form-urlencoded "bar.com"', t => {
  return request({
    url,
    method: 'PATCH',
    body: '"bar.com"',
    headers: getHeaders('application/x-www-form-urlencoded'),
  }).then((res) => {
    if (res.statusCode !== 200) {
      return t.fail('non 200: ' + res.statusCode);
    }

    return request({
      url,
      json: true,
      headers: getHeaders('application/json')
    }).then(res => {
      t.deepEqual(res.body, ['foo.com', 'bar.com'], 'body matches');
    });
  });
});

test(`x-www-form-urlencoded "{ "url": "bar.com" }"`, t => {
  return request({
    url,
    method: 'PATCH',
    body: '{ "url": "bar.com" }',
    headers: getHeaders('application/x-www-form-urlencoded'),
  }).then((res) => {
    if (res.statusCode !== 200) {
      return t.fail('non 200: ' + res.statusCode);
    }

    return request({
      url,
      json: true,
      headers: getHeaders('text/plain')
    }).then(res => {
      t.deepEqual(res.body, [
        'foo.com',
        { url: 'bar.com' },
      ], 'body matches');
    });
  });
});

test(`no mime 'bar.com'`, t => {
  return request({
    url,
    method: 'PATCH',
    body: 'bar.com',
    headers: getHeaders(),
  }).then((res) => {
    if (res.statusCode !== 200) {
      return t.fail('non 200: ' + res.statusCode);
    }

    return request({
      url,
      json: true,
      headers: getHeaders('text/plain')
    }).then(res => {
      t.deepEqual(res.body, [
        'foo.com',
        'bar.com',
      ], 'body matches');
    });
  });
});

test(`json (non-strict) '"bar.com"'`, t => {
  return request({
    url,
    method: 'PATCH',
    body: '"bar.com"',
    headers: getHeaders('application/json'),
  }).then((res) => {
    if (res.statusCode !== 200) {
      console.log(res.body);
      return t.fail('non 200: ' + res.statusCode);
    }

    return request({
      url,
      json: true,
      headers: getHeaders('text/plain')
    }).then(res => {
      t.deepEqual(res.body, [
        'foo.com',
        'bar.com',
      ], 'body matches');
    });
  });
});



















