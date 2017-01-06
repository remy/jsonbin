const express = require('express');
const version = require(__dirname + '/../../package.json').version;
const router = express.Router();
module.exports = router;

function mustAuthenticate(req, res, next) {
  if (req.user && req.user.publicId) {
    return next();
  }

  next(401);
}

// redirects
router.get(['/_', '/_/man'], (req, res) => res.redirect('/_/help'));
router.get('/_/login', (req, res) => res.redirect('/_/auth/github'));
router.get('/_/signout', (req, res) => res.redirect('/_/logout'));

router.get('/_/version', (req, res) => res.send(version));

// auth
router.use('/_/auth', require('./auth'));
router.get('/_/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// all following routes can have the user loaded via an API key
router.use(require('./auth/api'));

router.use('/_/me', mustAuthenticate, require('./me'));
router.get('/_/help', (req, res) => res.render('readme'));

router.use('/*/_perms', require('./perms'));
router.use('/:username', require('./api'));
router.get('/', (req, res) => res.render('readme'));



/* error handler */
router.use(require('./error'));
