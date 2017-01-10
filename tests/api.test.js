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

test('GET (mixed case username)', t => {
  return request(user, {
    url: `http://localhost:${process.env.PORT}/Test`
  }).then(body => {
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

test('DELETE (root, then POST)', t => {
  return request(user, {
    method: 'delete',
    url: base,
  }).then(() => {
    return request(user).then(body => {
      t.deepEqual(body, {
      }, 'body matches');
    });
  }).then(() => {
    const body = { 'foo': 'bar' };
    return request(user, {
      method: 'post',
      body
    }).then(newBody => {
      t.deepEqual(newBody, body, 'body matches');
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

test('PATCH (object - add new prop)', t => {
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

test('PATCH (root)', t => {
  // first reset to a object on the root
  return request(user, {
    method: 'post',
    url: base,
    body: { bar: 10 }
  }).then(() => {
    return request(user, {
      method: 'patch',
      url: base,
      body: {
        zoo: 11,
      }
    })
  }).then(() => {
    return request(user, { url: base }).then(body => {
      t.deepEqual(body, {
        zoo: 11,
        bar: 10,
      }, 'body matches');
    });
  });
});

test('PATCH (object - change old prop)', t => {
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
        bar: 11,
      }
    })
  }).then(() => {
    return request(user, { url: base + '/foo' }).then(body => {
      t.deepEqual(body, {
        zoo: 11,
        bar: 11,
      }, 'body matches');
    });
  });
});

test('PATCH (object - prop delete)', t => {
  return request(user, {
    method: 'post',
    url: base + '/foo',
    body: {
      bar: 10,
      zoo: 10,
    }
  }).then(() => {
    return request(user, {
      method: 'patch',
      url: base + '/foo',
      body: {
        zoo: null,
      }
    })
  }).then(() => {
    return request(user, { url: base + '/foo' }).then(body => {
      t.deepEqual(body, {
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

test('permissions', t => {
  return request(user, {
    method: 'put',
    url: base + '/urls/_perms',
  }).then(() => {
    return _request({
      url: base + '/urls',
      json: true
    }).then(res => {
      t.deepEqual(res.body, ['foo.com'], 'body matches');
    });
  });
});


tap.tearDown(() => {
  return teardown();
});
