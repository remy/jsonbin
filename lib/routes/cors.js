const cors = require('cors');
module.exports = cors({
  methods: ['GET'],
  origin: '*',
  allowedHeaders: ['Authorization', 'Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
});