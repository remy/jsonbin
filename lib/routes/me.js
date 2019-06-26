const undefsafe = require('undefsafe');
const { urlToArray } = require('./utils');

module.exports = (req, res) => {
  const path = urlToArray(req.url);
  const user = req.user.toObject();
  delete user.storeJson;
  delete user.store;
  res.status(200).json(undefsafe(user, path.join('.')));
};

// const uuid = require('uuid');
// router.delete('/apikey', (req, res) => {
//   const key = (req.user.apikey = uuid.v4());
//   req.user.save(() => {
//     res.status(201).json(key);
//   });
// });
