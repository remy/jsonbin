const tap = require('tap');
const { setup, teardown, request, base } = require('./utils');
const test = tap.test;
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
  user.markModified('store');
  user.save().then(() => done());
});

test('GET (no slash)', t => {
  return request(user).then(body => {
    t.deepEqual(body, {
      urls: ['foo.com']
    }, 'body matches');
  });
});

test('GET (with slash)', t => {
  return request(user, {
    url: base + '/',
  }).then(body => {
    t.deepEqual(body, {
      urls: ['foo.com']
    }, 'body matches');
  });
});

test('POST', t => {
  return request(user, {
    method: 'POST',
    url: base + '/foo/bar',
    body: {
      testing: true
    },
  }).then(() => {
    return request(user).then(body => {
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
  return request(user, {
    method: 'delete',
    url: base + '/urls',
  }).then(() => {
    return request(user).then(body => {
      t.deepEqual(body, {
      }, 'body matches');
    });
  });
});

test('DELETE (array)', t => {
  return request(user, {
    method: 'delete',
    url: base + '/urls/0',
  }).then(() => {
    return request(user).then(body => {
      t.deepEqual(body, { urls: [] }, 'body matches');
    });
  });
});

test('PATCH (object)', t => {
  return request(user, {
    method: 'post',
    url: base + '/foo',
    body: {
      bar: 10,
    }
  }).then(() => {
    return request(user, {
      method: 'patch',
      url: base + '/foo',
      body: {
        zoo: 11,
      }
    })
  }).then(() => {
    return request(user, { url: base + '/foo' }).then(body => {
      t.deepEqual(body, {
        zoo: 11,
        bar: 10,
      }, 'body matches');
    });
  });
});

test('PATCH (array)', t => {
  return request(user, {
    method: 'patch',
    url: base + '/urls',
    body: 'bar.com',
    json: false,
  }).then(() => {
    return request(user).then(body => {
      t.deepEqual(body, { urls: ['foo.com', 'bar.com'] }, 'body matches');
    });
  });
});

tap.tearDown(() => {
  return teardown();
});
