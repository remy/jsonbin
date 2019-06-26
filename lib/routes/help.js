const readme = require('../../views/readme');

module.exports = function help(req, res) {
  const data = Object.assign(
    {
      // bearer: req.user ? req.user.generateBearer({ expiresIn: '1 min' }) : '[token]',
      bearer: '[token]',
      username: 'example',
      apikey: 'abcd-xyz-123',
    },
    req.user ? req.user.toObject() : {}
  );

  res.end(readme({ ...data, HOST: process.env.HOST }));
};
