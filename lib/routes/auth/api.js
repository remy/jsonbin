const User = require('../../db/user');

// authenticate the user based on the header: `Authorization: <key>`
module.exports = (req, res, next) => {
  if (req.user) {
    if (!req.originalUrl.startsWith(`/${req.user.username}/`) &&
        !req.originalUrl.startsWith(`/_/`)) {
      req.url = req.originalUrl = `/${req.user.username}${req.originalUrl}`;
    }

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
          code: 422,
          message: 'Invalid auth token provided',
        });
      }
      req.user = user;
      res.locals.fromAPI = true;
      if (!req.originalUrl.startsWith(`/${user.username}/`) &&
          !req.originalUrl.startsWith(`/_/`)) {
        req.url = req.originalUrl = `/${user.username}${req.originalUrl}`;
      }
      return next();
    }).catch(next);
  }

  return next();
};
