const express = require('express');
const undefsafe = require('undefsafe');
const _ = require('lodash');
const multer  = require('multer');
const storage = multer.memoryStorage(); // FIXME
const User = require('../db/user');
const { noCache, urlToArray, cors } = require('./utils');
const fileType = require('file-type');

const upload = multer();
const router = express.Router({
  mergeParams: true,
});
module.exports = router;

// http://stackoverflow.com/a/39257322/22617
function deepMerge(object, source) {
  return _.mergeWith(object, source, (objValue, srcValue) => {
    if (_.isObject(objValue) && srcValue) {
      return deepMerge(objValue, srcValue);
    }
  });
}

router.use((req, res, next) => {
  if (req.accepts('application/json') !== 'application/json') {
    return next(406);
  }
  next();
});

router.use((req, res, next) => {
  const username = req.params.username;
  // validate either the route is public or that the user is the own
  if (req.user && username === req.user.username) {
    return next();
  }

  // only allow public requests using GET
  if (req.method !== 'GET') {
    return next(401);
  }

  if (req.url.startsWith('/_/')) {
    return next(401);
  }

  if (!username) {
    return next();
  }

  const path = urlToArray(req.path).join('.');
  User.findOne({ username }).then(user => {
    if (!user) {
      return next(404);
    }

    // allow for partial matches
    const match = user.public.find(_ => {
      return path.startsWith(_) || path.startsWith(`${_}.`);
    });

    if (match) {
      req.user = user.toObject();
      return next();
    }
    next(404);
  }).catch(next);
});

router.get('/*', cors, noCache, (req, res, next) => {
  if (!req.user) {
    return next('route');
  }
  const user = req.user;
  const path = urlToArray(req.path);
  const value = undefsafe(user.store, path.join('.'));

  if (value === undefined) {
    return res.status(404).send(null);
  }

  if (value._file) {
    res.type(value._file.mimetype);
    if (!req.accepts(value._file.mimetype)) {
      res.attachment(value._file.originalname);
    }

    return res.send(value._file.buffer.buffer);
  }

  res.send(value);
});

router.patch('/*', (req, res, next) => {
  const user = req.user;
  const path = urlToArray(req.path);
  const value = undefsafe(user.store, path.join('.'));

  if (value === undefined) {
    return res.status(404).send(null);
  }

  const parent = path.length ?
    undefsafe(user.store, path.join('.')) :
    user.store;

  // merge
  if (Array.isArray(parent)) {
    parent.push(req.body);
  } else {
    deepMerge(parent, req.body);
  }

  user.markModified('store');
  user.save().then(user => {
    res.send(undefsafe(user.store, path.join('.')));
  }).catch(e => {
    next(422);
  });
});

router.delete('/*', (req, res) => {
  const user = req.user;
  const path = urlToArray(req.path);
  const value = undefsafe(user.store, path.join('.'));

  if (value === undefined) {
    return res.status(404).send(null);
  }

  if (path.length) {
    const parent = undefsafe(user.store, path.slice(0, -1).join('.'));
    if (Array.isArray(parent)) {
      parent.splice(path.pop(), 1);
    } else {
      delete parent[path.pop()];
    }
  } else {
    user.store = {};
  }

  user.markModified('store');
  user.save().then(user => {
    res.send(value);
  });
});

router.post('/*', (req, res, next) => {
  const user = req.user;
  const path = urlToArray(req.path);
  const search = path.slice(0);
  let root = search.shift();
  if (req.user.store === undefined) {
    req.user.store = {};
  }
  let object = req.user.store;
  while (root && !object[root]) {
    object[root] = {};
    object = object[root];
    root = search.shift();
  }

  if (Object.keys(req.body).length === 0) {
    upload.any()(req, res, err => {
      if (err) {
        // An error occurred when uploading
        next(err);
      }

      // Everything went fine
      if (req.files) {
      //[req.files[0].originalname] = 's3://…';
        req.body._file = req.files[0];
        const ft = (fileType(req.body._file.buffer) || { mime: 'text/plain' });
        req.body._file.mimetype = ft.mime;
      }

      undefsafe(user.store, path.join('.'), req.body);
      user.markModified('store');
      user.save().then(user => {
        res.status(201).send(undefsafe(user.store, path.join('.')));
      }).catch(next);
    })
  } else {
    undefsafe(user.store, path.join('.'), req.body);
    user.markModified('store');
    user.save().then(user => {
      res.status(201).send(undefsafe(user.store, path.join('.')));
    }).catch(e => {
      console.log(e);
      next(422);
    });
  }

});
