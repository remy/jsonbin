const cookie = require('cookie');
const passport = require('passport');

passport.use('github', require('../../strategy').github);

module.exports = (req, res) => {
  passport.authenticate('github', { scope: ['user:email'] }, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: err.message });
    }

    if (!user) {
      return res.status(400).json({ message: 'Unable to get token' });
    }

    const token = user.generateBearer({ expiresIn: '60d' });

    res.setHeader(
      'Set-Cookie',
      cookie.serialize('token', token, {
        httpOnly: false,
        path: '/',
        maxAge: 60 * 60 * 24 * 7 * 52, // 1 year
      })
    );

    res.redirect('/');
  });
};
