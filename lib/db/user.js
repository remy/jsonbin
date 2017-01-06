const mongoose = require('./index');
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
  },
  password: String,
  store: {},
  public: [],
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now,
  }
}, { strict: false });

schema.pre('save', function (next) {
  this.updated = Date.now();
  next();
});


schema.statics.findOrCreate = ({ githubId = null, email } = {}, data) => {
  return User.findOne({ githubId }).then(user => {
    if (user) {
      return user;
    }

    const body = {
      email,
      githubId,
      store: data.store || null,
      apikey: uuid.v4(),
      username: data.login,
    }

    if (!body.store) {
      body.store = {
        gettingStarted: `check out the *help*, and try 'curl ${process.env.HOST}/${body.username} -H "authorization: token ${body.apikey}"'`,
        urls: ['help', 'me', 'logout'].map(_ => `${process.env.HOST}/_/${_}`),
      };
    }

    return new User(body).save();
  }).catch(e => {
    console.log('failed', e);
    throw e;
  });
};

const User = module.exports = mongoose.model('user', schema);
