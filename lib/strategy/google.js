const undefsafe = require('undefsafe');
const User = require('../db/user');
const Strategy = require('passport-google-oauth').OAuth2Strategy;

const strategy = new Strategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK,
}, (accessToken, refreshToken, profile, done) => {
  const email = undefsafe(profile, 'emails.0.value');
  const googleId = profile.id;
  User.findOrCreate({ email }, {
    googleId,
    githubProfile: profile._json,
    email,
  })
  .then(user => done(null, user))
  .catch(e => done);
});

module.exports = passport => ({
  root: passport.authenticate('google', { scope: [ 'email' ] }),
  callback: passport.authenticate('google', { failureRedirect: '/login' }),
});

module.exports.strategy = strategy;
