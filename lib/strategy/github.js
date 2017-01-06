const undefsafe = require('undefsafe');
const passport = require('passport');
const User = require('../db/user');
const Strategy = require('passport-github2').Strategy;

const strategy = new Strategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK,
}, (accessToken, refreshToken, profile, done) => {
  const email = undefsafe(profile, 'emails.0.value');
  User
    .findOrCreate({ githubId: profile.id, email }, profile._json)
    .then(user => done(null, user))
    .catch(e => done);
});

module.exports = {
  strategy,
  root: passport.authenticate('github', { scope: [ 'user:email' ] }),
  callback: passport.authenticate('github', { failureRedirect: '/login' }),
};
