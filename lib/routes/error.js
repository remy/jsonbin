const codes = require('http-status-codes');
const undefsafe = require('undefsafe');

module.exports = (error, req, res, next) => { // jshint ignore:line
  let message = null;
  let n;
  const { NODE_ENV } = process.env;

  if (typeof error === 'number') {
    n = error;
    error = new Error(codes.getStatusText(error));
    error.code = n;
  }
  message = error.message || codes.getStatusText(n);

  // Ensure we send the correct type of http status, if there's a real error
  // then the `error.code` will be a string, override with 500
  // 500, General error:
  let status = error.code || 500;
  if (typeof status === 'string') {
    status = 500;
  }

  // prepare the error page shown to the user
  const e = {
    message,
    status,
  };

  if (status === 401) {
    if (res.locals.apikey) {
      return res.status(401).json({
        status,
        message: message + ' (wrong api token)',
      });
    }

    return res.status(401).set('location', '/_/login').render('redirect', {
     layout: false,
     host: process.env.HOST,
    });
  }

  let msg = `${status} ${req.url} `;
  if (req.user) {
    msg += `${req.user.username} `;
  }
  msg += message;

  if (process.env.NODE_ENV !== 'test') {
    console.error(req.url, undefsafe(req, 'user.apikey') || req.headers.authorization, (error.stack || msg).split('\n').filter(_ => !_.includes('node_modules')).join('\n'));
  }

  // if (error.stack) { // if this is a real error (not expected), then log stack
  //   console.log(error.stack);
  // }

  res.status(status).json(e);
}
