const express = require('express');
const router = express.Router();

module.exports = router;

router.use('/github', require('./github'));
// router.use('/email', require('./email'));
