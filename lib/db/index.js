const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // http://mongoosejs.com/docs/promises.html

mongoose.connect(process.env.MONGO_URL, { useMongoClient: true });
const connection = mongoose.connection;

connection.on('error', (...rest) => {
  console.log('db error', rest);
});

connection.once('open', () => {
  require('./migrate');
});

module.exports = mongoose;
