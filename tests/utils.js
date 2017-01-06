const dotenv = require('dotenv');
dotenv.config({
  silent: true,
  path: `${__dirname}/../.${process.env.NODE_ENV}.env`,
});

const mongoose = require('../lib/db/');
const User = require('../lib/db/user');
const _request = require('./request-then');
// "test" is the username
const base = `http://localhost:${process.env.PORT}/test`;

module.exports = {
  setup,
  teardown,
  request,
  base,
  _request,
};

function request(user, {
  method = 'get',
  url = base,
  body = {},
  json = true,
} = {}) {
  return _request({
    method,
    body,
    url,
    json,
    headers: {
      authorization: `token ${user.apikey}`,
    },
  }).then(res => {
    return res.body;
  });
}

function setup(store = {}) {
  return User.findOrCreate({ githubId: 1, email: null }, {
    login: 'test',
    store,
  });
}

function teardown() {
  return User.remove({ username: 'test'}).then(() => {
    mongoose.connection.close();
  });
}
