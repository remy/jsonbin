const codes = require('http-status-codes');

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

  // prepare the error page shown to the user
  var e = {
    message,
    stack: n ? undefined : error.stack,
  };

  // don't send this back to our users in production
  if (NODE_ENV === 'production') {
    delete e.stack;
  }

  // Ensure we send the correct type of http status, if there's a real error
  // then the `error.code` will be a string, override with 500
  // 500, General error:
  var status = error.code || 500;
  if (typeof status === 'string') {
    status = 500;
  }

  if (status === 401) {
    return res.status(401).set('location', '/_/auth/github').render('redirect', {
     layout: false,
     host: process.env.HOST,
    });
  }

  console.log('%s %s %s', status, req.url, message);

  if (!n) {
    // console.log(e.stack);
  }

  res.status(status).send(e);

}
