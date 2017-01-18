const express = require('express');
const undefsafe = require('undefsafe');
const uuid = require('uuid');
const { urlToArray } = require('./utils');
const router = express.Router();
module.exports = router;

router.get('*', (req, res) => {
  const path = urlToArray(req.url);
  const user = req.user.toObject();
  delete user.store;
  res.status(200).json(undefsafe(user, path.join('.')));
});

router.delete('/apikey', (req, res) => {
  req.user.apikey = uuid.v4();
  req.user.save(_ => {
    res.redirect('/_/me/apikey');
  });
});
