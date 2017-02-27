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
}, {
  toObject: {
    transform: function (doc, ret) {
      ret.store = JSON.parse(doc.storeJson);
      ret.id = doc._id;
      delete ret.__v;
      delete ret.ownerId;
      delete ret._id;
      delete ret.storeJson;
    }
  }
});

module.exports = mongoose.model('archive', schema);
