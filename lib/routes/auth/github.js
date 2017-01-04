const express = require('express');
const { root, callback } = require('../../strategy/github');
const router = express.Router();

module.exports = router;

router.get('/', root);
router.get('/callback', callback, (req, res) => res.redirect('/'));
