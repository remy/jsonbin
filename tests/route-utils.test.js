const test = require('tap').test;
const { urlToArray } = require('../lib/routes/utils');

test('urlToArray', t => {
  t.deepEqual(urlToArray('/url/1/'), ['url', '1']);

  t.end();
});
