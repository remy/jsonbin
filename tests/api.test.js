const tap = require('tap');
const _request = require('./request-then');
const util = require('./user');
const test = tap.test;
const root = `http://localhost:${process.env.PORT}/test`; // "test" is the username
let user = null;

function request({ method = 'get', url = root, body = {} } = {}) {
  return _request({
    method,
    body,
    url,
    json: true,
    headers: {
      authorization: `token ${user.apikey}`,
    },
  }).then(res => {
    return res.body;
  });
}

test('load user', t => {
  return util.setup({
    urls: ['foo.com']
  }).then(u => user = u).then(() => t.pass('user loaded'));
});

// reset the user store
tap.afterEach(done => {
  user.store = {
    urls: ['foo.com']
  };
  user.markModified('store');
  user.save().then(() => done());
});

test('GET (no slash)', t => {
  return request().then(body => {
    t.deepEqual(body, {
      urls: ['foo.com']
    }, 'body matches');
  });
});

test('GET (with slash)', t => {
  return request({
    url: root + '/',
  }).then(body => {
    t.deepEqual(body, {
      urls: ['foo.com']
    }, 'body matches');
  });
});

test('POST', t => {
  return request({
    method: 'POST',
    url: root + '/foo/bar',
    body: {
      testing: true
    },
  }).then(() => {
    return request().then(body => {
      t.deepEqual(body, {
        urls: ['foo.com'],
        foo: {
          bar: {
            testing: true
          }
        }
      }, 'body matches');
    });
  }).catch(e =>{
    console.log(e);
    throw e;
  });
});

test('DELETE', t => {
  return request({
    method: 'delete',
    url: root + '/urls',
  }).then(() => {
    return request().then(body => {
      t.deepEqual(body, {
      }, 'body matches');
    });
  });
});

tap.tearDown(() => {
  return util.teardown();
});
