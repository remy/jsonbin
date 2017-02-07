const mongoose = require('./');
const col = mongoose.connection.collection('users');

// migration 2017-02-07 https://github.com/remy/jsonbin/issues/13
col.find({}).toArray((err, users) => {
  users.map(user => {
    const { publicId } = user;
    if (user.store) {
      console.log('convert %s', publicId);
      col.updateOne({ publicId }, { $unset: { store: 1 }, $set: { storeJson: JSON.stringify(user.store) }}).then(() => {
        console.log('%s updated', publicId);
      }).catch(e => {
        console.error('migration 1', publicId, e.stack);
      });
    }
  })
});
