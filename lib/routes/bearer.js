const express = require('express');
const undefsafe = require('undefsafe');
const { urlToArray } = require('./utils');
const ms = require('ms');
const router = express.Router();
module.exports = router;

router.get('*', (req, res) => {
  const expiresIn = req.query.exp || req.query.expiresIn || '1 hour';
  const token = req.user.generateBearer(expiresIn);
  const result = { token, exp: ms(ms(expiresIn), { long: true }) };
  const path = urlToArray(req.path);
  res.status(201).json(undefsafe(result, path.join('.')));
});

