const dotenv = require('dotenv');
dotenv.config({
  silent: true,
  path: `${__dirname}/../.${process.env.NODE_ENV}.env`,
});

const mongoose = require('../lib/db/');
const fs = require('fs');
const User = require('../lib/db/user');
const _request = require('./request-then');
// "test" is the username
const root = `http://localhost:${process.env.PORT}`;
const base = `${root}/test`;

module.exports = {
  setup,
  updateUser,
  teardown,
  request,
  base,
  _request,
  op,
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
  return User.remove({ username: 'test'}).then(() => {
    return User.findOrCreate({ githubId: 1, email: null }, {
      login: 'test',
      store,
    });
  })
}

function updateUser({ publicId }) {
  return User.findOne({ publicId });
}

function teardown() {
  return User.remove({ username: 'test'}).then(() => {
    mongoose.connection.close();
  });
}

function op(file) {
  const body = fs.readFileSync(file, 'utf8');
  const requests = [];
  let index = -1;
  const lines = body.split('\n');

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    if (line === '') {
      continue;
    }

    if (line.startsWith('//')) { // comment
      continue;
    }

    if (line.startsWith('# ')) {
      // TODO check last request is done
      let [ , method, url ] = line.split(' ');
      index++;
      requests[index] = {
        method,
        url: root + url,
        headers: {},
      }
      continue;
    }

    if (line.toLowerCase() === 'headers:') {
      i++;
      while (line = lines[i].trim()) {
        const parts = line.split(':');
        requests[index].headers[parts[0].trim().toLowerCase()] = parts.slice(1).join(':').trim();
        i++;
      }
      continue;
    }

    requests[index].body = line;
  }

  return requests;
}
