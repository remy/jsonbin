const mongoose = require('./index');

const schema = mongoose.Schema({
  storeJson: String,
  ownerId: {
    type: String,
    required: true,
    index: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  method: String,
  path: String,
});

module.exports = mongoose.model('archive', schema);
