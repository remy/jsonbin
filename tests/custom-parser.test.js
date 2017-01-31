const test = require('tap').test;
const parser = require('../lib/custom-body-parser');

const getReq = ({ body, rawBody }) => {
  return {
    get: () => {
      return 'application/x-www-form-urlencoded';
    },
    method: 'POST',
    body,
    rawBody,
  }
}

test('filled array', t => {
  const req = getReq({
    rawBody: '["foo.com","bar.com"]',
    body: { '"foo.com","bar.com"': '' },
  });

  parser(req, null, () => {
    t.deepEqual(req.body, ['foo.com', 'bar.com']);
    t.end();
  })
})

test('empty array', t => {
  const req = getReq({
    rawBody: '[]',
    body: { '0': '' },
  });

  parser(req, null, () => {
    t.deepEqual(req.body, []);
    t.end();
  })
})

test('empty object', t => {
  const req = getReq({
    rawBody: '{}',
    body: { '{}': '' },
  });

  parser(req, null, () => {
    t.deepEqual(req.body, {});
    t.end();
  })
})

test('string', t => {
  const req = getReq({
    rawBody: '"testing"',
    body: { 'testing': '' },
  });

  parser(req, null, () => {
    t.deepEqual(req.body, "testing");
    t.end();
  })
})
