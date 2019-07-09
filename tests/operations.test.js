const tap = require('tap');
const test = require('tap-only');
const fs = require('fs');
const {
  op,
  setup,
  teardown,
  updateUser,
  _request: request,
} = require('./utils');
let user = null;

test('load user', t => {
  return setup({})
    .then(u => (user = u))
    .then(() => t.pass('user loaded'));
});

// reset the user store
tap.afterEach(done => {
  user.store = {};
  user.dirty();
  user.save().then(() => done());
});

tap.tearDown(() => {
  return teardown();
});

const dir = __dirname + '/operations/';
const tests = fs
  .readdirSync(dir)
  .filter(_ => {
    if (process.env.TEST) {
      return _.includes(process.env.TEST);
    }
    return true;
  })
  .reduce((acc, file) => {
    const [id] = file.split('.');
    acc[id] = op(dir + file);
    return acc;
  }, {});

Object.keys(tests).forEach(id => {
  test(tests[id].name || `issue #${id}`, t => {
    user.store = tests[id].setup;
    const expect = tests[id].expect;
    user.dirty();
    return user.save().then(() => {
      const tokens = {
        token: user.apikey,
        bearer: user.generateBearer(),
      };

      const requests = tests[id].op.reduce((acc, op) => {
        if (op.headers.authorization) {
          const [scheme] = op.headers.authorization.split(' ');
          op.headers.authorization = scheme + ' ' + tokens[scheme];
        }

        return acc.then(() =>
          request({
            url: op.url,
            headers: op.headers,
            method: op.method,
            body: op.body,
          }).then(res => {
            t.ok(
              op.status ? op.status === res.statusCode : res.statusCode < 300,
              `${op.method} ${op.url}: ${res.statusCode}`
            );
            if (res.statusCode === 500) {
              t.fail(res.body);
            }

            return res;
          })
        );
      }, Promise.resolve());

      return requests
        .then(res => {
          if (res.req.method === 'GET') {
            if (res.headers['content-type'].includes('application/json')) {
              return JSON.parse(res.body);
            }
            return res.body;
          }
          return updateUser(user).then(user => user.toObject().store);
        })
        .then(store => {
          t.deepEqual(
            expect,
            store,
            `expected response matches: ${JSON.stringify(store)}`
          );
        });
    });
  });
});
