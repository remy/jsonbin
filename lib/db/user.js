const mongoose = require('mongoose');
const uuid = require('uuid');

const schema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: {
      unique: true,
    },
  },
  publicId: {
    type: String,
    default: uuid.v4,
    required: true,
    index: {
      unique: true,
    },
  },
  apikey: {
    type: String,
    default: uuid.v4,
    required: true,
    index: {
      unique: true,
    },
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    index: {
      unique: true,
    },
  },
  password: String,
  store: {},
  public: [],
}, { strict: false });


schema.statics.findOrCreate = ({ email = null } = {}, data) => {
  return User.findOne({ email }).then(user => {
    if (user) {
      return user;
    }
    console.log('making new');
    data.email = email;
    data.apikey = uuid.v4();
    data.store = {
      gettingStarted: `check out the *help*, and try 'curl ${process.env.HOST} -H "authorization: token ${data.apikey}"'`,
      urls: ['help', 'me', 'logout'].map(_ => `${process.env.HOST}/_/${_}`),
    };

    // FIXME allow users to change their username
    data.username = data.githubProfile.login;

    return new User(data).save();
  }).catch(e => {
    console.log('failed', e);
    throw e;
  });
};

const User = module.exports = mongoose.model('user', schema);
