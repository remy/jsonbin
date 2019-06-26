const cors = require('cors');
module.exports = cors({
  origin: '*',
  allowedHeaders: ['Authorization', 'Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
});
