const express = require('express');
const passport = require('../../passport');
const router = express.Router();

module.exports = router;

router.post('/',
  passport.authenticate('local', { failureRedirect: '/?failed' }),
  (req, res) => res.redirect('/')
);
