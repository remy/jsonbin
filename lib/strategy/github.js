const undefsafe = require('undefsafe');
const passport = require('passport');
const request = require('request');
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
    .then(user => {
      if (user.email) {
        return done(null, user);
      }

      // otherwise go get their email address and store it
      request({
        url: 'https://api.github.com/user/emails',
        json: true,
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
          authorization: `token ${accessToken}`,
        },
      }, (error, res, body) => {
        if (error) {
          return done(null, user);
        }

        user.email = body.find(_ => _.primary).email;

        user.save().then(user => done(null, user)).catch(done);
      });
    })
    .catch(e => done(e));
});

module.exports = {
  strategy,
  root: passport.authenticate('github', { scope: [ 'user:email' ] }),
  callback: passport.authenticate('github', { failureRedirect: '/login' }),
};
