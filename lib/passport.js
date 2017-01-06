// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
const passport = require('passport');
const User = require('./db/user');

if (process.env.NODE_ENV !== 'test') {
  passport.use('github', require('./strategy/github').strategy);
}

passport.serializeUser((user, done) => {
  done(null, user.publicId);
});

passport.deserializeUser((publicId, done) => {
  User.findOne({ publicId }).then(user => {
    done(null, user);
  }).catch(done);
});

module.exports = passport;
