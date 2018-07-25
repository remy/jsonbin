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

function request(
  user,
  { method = 'get', url = base, body = {}, json = true } = {}
) {
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
  return User.remove({ username: 'test' }).then(() => {
    return User.findOrCreate(
      { githubId: 1, email: null },
      {
        login: 'test',
        store,
      }
    );
  });
}

function updateUser({ publicId }) {
  return User.findOne({ publicId });
}

function teardown() {
  return User.remove({ username: 'test' }).then(() => {
    mongoose.connection.close();
  });
}

function op(file) {
  let index = -1;
  const requests = [];
  const config = {
    setup: '',
    expect: '',
    name: '',
  };

  const lines = fs.readFileSync(file, 'utf8').split('\n');

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // new section (of name, setup, expect)
    if (line[0] === '+') {
      // slurp blank lines and the body
      let type = line
        .trim()
        .slice(1)
        .trim()
        .toLowerCase();
      i++;
      while ((line = lines[i].trim())) {
        config[type] += line;
        i++;
      }
      continue;
    }

    if (line === '') {
      continue;
    }

    if (line.startsWith('//')) {
      // comment
      continue;
    }

    if (line.startsWith('# ')) {
      // TODO check last request is done
      let [, method, url, status = null] = line.split(' ');
      index++;
      requests[index] = {
        method,
        url: root + url,
        headers: {},
        body: '',
        status: status ? parseInt(status, 10) : null,
      };
      continue;
    }

    if (line.toLowerCase() === 'headers:') {
      i++;
      while ((line = lines[i].trim())) {
        const parts = line.split(':');
        requests[index].headers[parts[0].trim().toLowerCase()] = parts
          .slice(1)
          .join(':')
          .trim();
        i++;
      }
      continue;
    }

    requests[index].body += line;
  }

  const setup = new Function('return ' + (config.setup || 'null'))();
  const expect = new Function('return ' + (config.expect || 'null'))();

  return {
    name: config.name,
    setup,
    expect,
    op: requests,
  };
}
