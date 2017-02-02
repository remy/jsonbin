const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // http://mongoosejs.com/docs/promises.html

mongoose.connect(process.env.MONGO_URL);
const connection = mongoose.connection;

connection.on('error', (...rest) => {
  console.log('db error', rest);
});

// connection.once('open', () => console.log('db open'));

module.exports = mongoose;
