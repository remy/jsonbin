const User = require('../../db/user');
const ua = require('universal-analytics');

function startAnalyics(req, res) {
  // this is incomplete, but a good start
  if (process.env.ANALYTICS) {
    let visitor;
    if (req.user) {
      visitor = ua(process.env.ANALYTICS, req.user.publicId);
    } else {
      visitor = ua(process.env.ANALYTICS, '00000000-0000-0000-0000-000000000000', {https: true}); // anon
    }

    visitor.pageview(req.originalUrl).send();
  }
}

// authenticate the user based on the header: `Authorization: <key>`
module.exports = (req, res, next) => {
  if (req.user) {
    startAnalyics(req, res);
    return next();
  }
  const auth = req.headers.authorization;
  const apikey = auth && auth.replace(/^token:?\s/i, '').trim();

  if (apikey) {
    res.locals.apikey = apikey;

    return User.findOne({
      apikey
    }).then(user => {
      if (!user) {
        return next({
          code: 412,
          message: 'Invalid auth token provided',
        });
      }
      req.user = user;
      res.locals.fromAPI = true;
      startAnalyics(req, res);
      return next();
    }).catch(next);
  }

  startAnalyics(req, res);
  return next();
};
