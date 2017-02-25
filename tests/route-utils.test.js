const test = require('tap').test;
const { partialMatch, urlToArray, urlToPath } = require('../lib/routes/utils');

test('partialMatch', t => {
  const allowed = 'b1';

  [
    'b1',
    'b1/foo',
    'b1.foo',
    'b1["foo"]',
    "b1['foo']",
  ].forEach(_ => {
    t.ok(partialMatch(_, allowed), _);
  });

  t.notOk(partialMatch('b123', allowed), 'b123 not allowed');
  t.end();
});

test('urlToArray', t => {
  t.deepEqual(urlToArray('/url/1/'), ['url', '1']);

  t.end();
});

test('urlToPath (simple)', t => {
  t.deepEqual(urlToPath('/url/1/'), 'url.1');

  t.end();
});

test('urlToPath (with period)', t => {
  t.deepEqual(urlToPath('/one.two'), '["one.two"]');
  t.deepEqual(urlToPath('/url/of/one.two'), 'url.of["one.two"]');
  t.deepEqual(urlToPath('/url/of/one.two/three'), 'url.of["one.two"].three');

  t.end();
});
