const express = require('express');
const undefsafe = require('undefsafe');
const jsonmergepatch = require('json-merge-patch');
const multer  = require('multer');
const User = require('../db/user');
const { noCache, urlToArray, urlToPath, partialMatch } = require('./utils');
const fileType = require('file-type');
const cors = require('./cors');

const upload = multer();
const router = express.Router({
  mergeParams: true,
});
module.exports = router;

router.options('*', cors);

router.use((req, res, next) => {
  res.locals.timings.start('Logic');
  if (req.accepts('application/json') !== 'application/json') {
    return next(406);
  }
  next();
});

router.use((req, res, next) => {
  const username = req.params.username;
  // validate either the route is public or that the user is the own
  if (req.user && (username === req.user.username || username === 'me')) {
    return next();
  }

  if (req.method === 'OPTIONS') {
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

  const path = urlToPath(req.path);
  User.findOne({ username }).then(user => {
    if (!user) {
      return next(404);
    }

    // allow for partial matches
    const match = user.public.find(_ => partialMatch(path, _));

    if (match) {
      req.user = user.toObject();
      return next();
    }
    next(404);
  }).catch(next);
});

router.use((req, res, next) => {
  if (res.locals.fromAPI) {
    // simple metrics
    const user = req.user;
    if (!user.requests) {
      user.requests = {};
    }
    if (!user.requests[req.method]) {
      user.requests[req.method] = 0;
    }
    user.requests[req.method]++;

    user.dirty('requests');
    user.save().catch(e => {
      console.log('failed to updated requests', e);
    }); // fire and forget
  }

  next();
});

router.get('/*', cors, noCache, (req, res, next) => {
  if (!req.user) {
    return next('route');
  }
  const user = req.user;
  const path = urlToPath(req.path);

  if (res.locals.restricted) {
    // validate the request is allowed this deep
    if (!partialMatch(res.locals.restricted, path)) {
      return res.status(401).json(null);
    }
  }

  const value = undefsafe(user.store, path);

  if (value === undefined) {
    return res.status(404).json(null);
  }

  if (value._file) {
    res.type(value._file.mimetype);
    if (!req.accepts(value._file.mimetype)) {
      res.attachment(value._file.originalname);
    }

    return res.status(200).json(value._file.buffer.buffer);
  }

  if (typeof value === 'string') {
    // force to plain text (in a browser)
    res.set('content-type', 'text/plain');
    return res.send(value.toString());
  }

  res.json(value);
});

router.patch('/*', (req, res, next) => {
  const user = req.user;
  const path = urlToArray(req.path);
  const value = undefsafe(user.store, path.join('.'));

  if (value === undefined) {
    return res.status(404).json(null);
  }

  const parent = path.length ?
    undefsafe(user.store, path.join('.')) :
    user.store;

  // merge
  if (Array.isArray(parent)) {
    parent.push(req.body);
  } else {
    const result = jsonmergepatch.apply(parent, req.body);
    undefsafe(user.store, path.join('.'), result);
  }

  user.dirty('storeJson', { method: 'PATCH', path: path.join('.') });
  user.save().then(user => {
    res.status(200).json(undefsafe(user.store, path.join('.')));
  }).catch(e => {
    next(422);
  });
});

router.delete('/*', (req, res) => {
  const user = req.user;
  const path = urlToArray(req.path);
  const value = undefsafe(user.store, path.join('.'));

  if (value === undefined) {
    return res.status(404).json(null);
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

  user.dirty('storeJson', { method: 'DELETE', path: urlToArray(req.path).join('.') });
  user.save().then(user => {
    res.status(200).json(value);
  });
});

router.post('/*', (req, res, next) => {
  const user = req.user;
  const path = urlToArray(req.path);
  const search = path.slice(0);
  let root = search.shift();
  if (user.store === undefined) {
    user.store = {};
  }

  // this primes the target location in the store, i.e. if the store is `{}`,
  // and we're setting /foo/bar, we need to create the object path to
  // { foo: { bar: {} } }
  // FIXME this expansion logic should really be inside of undefsafe
  let object = user.store;
  let parent = ['store'];
  while (root) {
    if (!object[root]) {
      if (Array.isArray(object)) {
        // Ref #23 on github
        // if we encounter an array, we need to coerce it into an object,
        // so we do that by: Object.assign({}, ['a', 'b']) === { 0: 'a', 1: 'b' }
        let updated = null;
        if (parent.length === 1) {
          // shallow (i.e. root level) coercion, thus simpler
          updated = user.store = Object.assign({}, user.store);
        } else {
          // this is deep array coercion
          updated = Object.assign({}, undefsafe(user, parent.join('.')));
          undefsafe(user, parent.join('.'), updated);
        }
        object = updated;
      }
      object[root] = {};
    }
    object = object[root];
    parent.push(root);
    root = search.shift();
  }

  // now go get the body either from the URL or from a file upload
  const promise = new Promise((resolve, reject) => {
    if (Object.keys(req.body).length !== 0) {
      return resolve(req.body);
    }

    upload.any()(req, res, err => {
      if (err) {
        // An error occurred when uploading
        return reject(err);
      }

      // Everything went fine
      if (req.files) {
      //[req.files[0].originalname] = 's3://…';
        req.body._file = req.files[0];
        const ft = (fileType(req.body._file.buffer) || { mime: 'text/plain' });
        req.body._file.mimetype = ft.mime;
      }

      return resolve(req.body);
    });
  }).then(body => {
    const storePath = path.join('.');
    if (!storePath) { // this means it's a root reset
      user.store = body;
    } else {
      undefsafe(user.store, storePath, body);
    }

    user.dirty('storeJson', { method: 'POST', path: storePath });
    return user.save().then(user => {
      res.status(201).json(undefsafe(user.store, path.join('.')));
    }).catch(e => {
      console.error(e);
      next(422);
    });
  });

});
