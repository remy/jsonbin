// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
const passport = require('passport');
const githubStrategy = require('./strategy/github').strategy;
const User = require('./db/user');

passport.use('github', githubStrategy);

passport.serializeUser((user, done) => {
  done(null, user.publicId);
});

passport.deserializeUser((publicId, done) => {
  User.findOne({ publicId }).then(user => {
    done(null, user);
  }).catch(done);
});

module.exports = passport;
