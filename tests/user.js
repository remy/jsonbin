const dotenv = require('dotenv');
dotenv.config({
  silent: true,
  path: `${__dirname}/../.${process.env.NODE_ENV}.env`,
});

const mongoose = require('../lib/db/');
const User = require('../lib/db/user');

module.exports = {
  setup,
  teardown,
};

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
