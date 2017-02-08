const tap = require('tap');
const test = require('tap-only');
const { setup, teardown, request, base, _request } = require('./utils');
let user = null;

test('load user', t => {
  return setup({
    urls: {}
  }).then(u => user = u).then(() => t.pass('user loaded'));
});

// reset the user store
tap.afterEach(done => {
  user.store = {
    urls: {}
  };
  user.dirty();
  user.save().then(() => done());
});

tap.tearDown(() => {
  return teardown();
});

test('POST url["one.two"]', t => {
  return request(user, {
    method: 'POST',
    body: {
      'one.two': true
    },
  }).then(body => {
    t.deepEqual(body, { 'one.two': true }, 'body matches');

    return request(user, {
      url: base + '/one.two'
    }).then(body => {
      t.equal(body, true, `${base}/one.two matches ${body}`)
    });
  });
});

test('POST url["one.two"] v2', t => {
  return request(user, {
    method: 'POST',
    body: {
      a: { 'one.two': { a: true } }
    },
  }).then(body => {
    t.deepEqual(body, { a: { 'one.two': { a: true } } }, 'body matches');

    return request(user, {
      url: base + '/a/one.two/a'
    }).then(body => {
      t.equal(body, true, `${base}/one.two/a matches ${body}`)
    });
  });
});
