const Strategy = require('passport-github2').Strategy;
const User = require('./db/user');
const get = require('lodash.get');
const request = require('request');

exports.github = new Strategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_SECRET,
  },
  (accessToken, refreshToken, profile, done) => {
    const email = get(profile, 'emails.0.value');
    User.findOrCreate({ githubId: profile.id, email }, profile._json).then(
      user => {
        if (user.email) {
          return done(null, user);
        }

        // otherwise go get their email address and store it
        request(
          {
            url: 'https://api.github.com/user/emails',
            json: true,
            headers: {
              'user-agent':
                'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
              authorization: `token ${accessToken}`,
            },
          },
          (error, response, body) => {
            if (error) {
              return done(error);
            }
            user.email = body.find(_ => _.primary).email;

            return user
              .save()
              .then(user => done(null, user))
              .catch(e => done(e));
          }
        );
      }
    );
  }
);
