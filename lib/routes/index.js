const express = require('express');
const version = require(__dirname + '/../../package.json').version;
const cors = require('./cors');
const router = express.Router();
module.exports = router;

function mustAuthenticate(req, res, next) {
  if (req.user && req.user.publicId) {
    return next();
  }

  next(401);
}

function help(req, res) {
  const data = Object.assign({
    version,
    bearer: req.user ? req.user.generateBearer({ expiresIn: '1 min' }) : '[token]',
    username: 'example',
    apikey: 'abcd-xyz-123'
  }, req.user ? req.user.toObject() : {});

  res.render('readme', data);
}

// redirects
router.get('/robots.txt', (req, res) => res.send(''));
router.get(['/_', '/_/man'], (req, res) => res.redirect('/_/help'));
router.get('/_/login', (req, res) => res.redirect('/_/auth/github'));
router.get('/_/signout', (req, res) => res.redirect('/_/logout'));

router.get('/_/version', (req, res) => res.status(200).json(version));

// auth
router.use('/_/auth', require('./auth'));
router.get('/_/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// all following routes can have the user loaded via an API key
router.use(cors, require('./auth/api'));

router.use('/_/archives', mustAuthenticate, require('./archives'));
router.use('/_/bearer', mustAuthenticate, require('./bearer'));
router.use('/_/me', mustAuthenticate, require('./me'));
router.get('/_/help', help);

router.use('/*/_perms', require('./perms'));

router.param('username', (req, res, next) => {
  req.params.username = req.params.username.toLowerCase();
  next();
});
// router.use('/me/', require('./api')); // support `me` shortcut
router.use('/:username', require('./api'));
router.get('/', help);
