const express = require('express');
const mongoose = require('mongoose');
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

router.param('id', (req, res, next, id) => {
  try {
    id = req.params.id = mongoose.Types.ObjectId(id);
  } catch (e) {
    if (id !== 'last') {
      return next({
        code: 404,
        message: 'Bad identifier for archive'
      })
    }
    id = req.params.id = req.user.archives.slice(-1).shift();
  }

  Archive.findOne({ _id: id, ownerId: req.user.publicId }).then(archive => {
    if (!archive) {
      return next(404);
    }
    res.locals.archive = archive.toObject();
    next();
  }).catch(next);
})

router.get('/', (req, res, next) => {
  const { limit = 100 } = req.query;
  Archive.find({ ownerId: req.user.publicId }).limit(limit).sort({ created: -1 })
  .then(_ => {
    const result = _.map(_ => _.toObject()).reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});
    res.status(200).json(result);
  }).catch(next)
});

router.get('/:id\.diff', (req, res, next) => {
  const delta = jsondiffpatch.diff(res.locals.archive.store, req.user.store);

  res.status(200).render('diff', {
    layout: false,
    id: req.params.id,
    res: jsondiffpatch.formatters.html.format(delta)
  });
})

router.get('/:id', (req, res, next) => {
  const { archive } = res.locals;
  res.header('x-method', archive.method);
  res.header('x-path', archive.path);
  res.header('x-modified', archive.created);
  res.status(200).json(archive);
})
