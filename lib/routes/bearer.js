const express = require('express');
const undefsafe = require('undefsafe');
const { urlToArray } = require('./utils');
const ms = require('ms');
const router = express.Router();
module.exports = router;

router.get('*', (req, res) => {
  const expiresIn = req.query.exp || req.query.expiresIn || '1 hour';
  let { path = '' } = req.query;
  path = urlToArray(`/${path}`).join('.');
  const token = req.user.generateBearer({ expiresIn, path });
  const exp = ms(ms(expiresIn), { long: true });
  const result = { token, exp, path };
  const prop = urlToArray(req.path).join('.');
  res.status(201).json(undefsafe(result, prop));
});

