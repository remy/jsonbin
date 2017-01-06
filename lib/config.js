const dotenv = require('dotenv');

let env = '.env';

if (process.env.NODE_ENV !== 'production') {
  env = `.${process.env.NODE_ENV}${env}`;
}

if (!process.env.PORT) {
  process.env.PORT = 3000;
}

if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = 'store.fklwejlfjwe';
}

dotenv.config({
  silent: true,
  path: __dirname + '/../' + env,
});

module.exports = process.env;
