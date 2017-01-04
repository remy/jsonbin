const Stripe = require('stripe');
const passport = require('passport');
const StripeStrategy = require('passport-stripe').Strategy;
const StripeAccount = require('../db/account');
const User = require('../db/user');

const strategy = new StripeStrategy({
  clientID: process.env.STRIPE_CLIENT_ID,
  clientSecret: process.env.STRIPE_API_KEY,
  callbackURL: process.env.STRIPE_CALLBACK,
  passReqToCallback: true,
}, (req, accessToken, refreshToken, stripe_properties, done) => {
  if (!req.user) {
    return done(new Error('requires sign in'));
  }

  const stripeId = stripe_properties.stripe_user_id;
  const stripe = Stripe(accessToken);
  return stripe.accounts.retrieve(stripeId).then(account => {
    const data = {
      token: stripe_properties,
      account,
      id: stripeId,
      accessToken,
    };
    return StripeAccount.findOrCreate(data);
  }).then(account => {
    console.log('conecting account');
    const { email } = account.accountData;
    const user = req.user;
    if (!user.accounts) {
      user.accounts = [];
    }
    const add = !user.accounts.some(a => a.id === stripeId);
    if (add) {
      console.log('adding account');
      user.accounts.addToSet(account);
      user.markModified('accounts');
    }
    return user.save();
  })
  .then(user => done(null, user))
  .catch(done);
});

module.exports = passport => ({
  root: passport.authorize('stripe', { scope: 'read_only' }),
  callback: passport.authorize('stripe', { failureRedirect: '/?failed-stripe' }),
});

module.exports.strategy = strategy;
