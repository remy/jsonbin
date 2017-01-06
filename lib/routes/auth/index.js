const express = require('express');
const router = express.Router();

module.exports = router;

if (process.env.NODE_ENV !== 'test') {
  router.use('/github', require('./github'));
}
