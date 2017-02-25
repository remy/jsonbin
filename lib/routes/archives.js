const express = require('express');
const jsondiffpatch = require('jsondiffpatch')
const User = require('../db/user');
const Archive = require('../db/archive');
const router = express.Router();
module.exports = router;

router.use((req, res, next) => {
  if (req.user.accountType.name === User.types.TYPE_PRO) {
    return next();
  }

  return next({
    code: 402,
    message: 'Paid account required'
  });
});

router.get('/', (req, res, next) => {
  User.findOne({ _id: req.user._id }).populate('archives')

  // Promise.resolve(req.user)

  .then(user => {
    const result = user.archives.sort((a, b) => {
      return a.created < b.created;
    }).map(_ => {
      return {
        store: JSON.parse(_.storeJson),
        created: _.created,
        method: _.method,
        path: _.path,
        id: _._id
      };
    }).reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});
    res.status(200).json(result);
  }).catch(next)
});

router.get(/([\d\w]+)\.diff/, (req, res, next) => {
  let id = req.params[0];
  if (id === 'last') {
    id = req.user.archives.slice(-1).shift();
  }

  Archive.findOne({ _id: id, ownerId: req.user.publicId })
  .then(_ => {
    const store = JSON.parse(_.storeJson);
    const delta = jsondiffpatch.diff(store, req.user.store);

    res.status(200).render('diff', {
      layout: false,
      id,
      res: jsondiffpatch.formatters.html.format(delta)
    });
  }).catch(next);
})

router.get(/([\d\w]+).*/, (req, res, next) => {
  let id = req.params[0];
  if (id === 'last') {
    id = req.user.archives.slice(-1).shift();
  }
  Archive.findOne({ _id: id, ownerId: req.user.publicId })
  .then(_ => {
    const result = {
      store: JSON.parse(_.storeJson),
      created: _.created,
      method: _.method,
      path: _.path,
      id: _._id
    };
    res.header('x-method', _.method);
    res.header('x-path', _.path);
    res.header('x-modified', _.created);
    res.status(200).json(JSON.parse(_.storeJson));
  }).catch(next);
})
