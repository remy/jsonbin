const mongoose = require('./index');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const TYPE_FREE = 'FREE';
const TYPE_SUPPORTER = 'SUPPORTER';
const TYPE_PRO = 'PRO';

const schema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
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
  // store: String,
  storeJson: String,
  public: [],
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now,
  },
  requests: {},
  accountType: {
    updated: Date,
    name: {
      type: String,
      enum: [TYPE_FREE, TYPE_SUPPORTER, TYPE_PRO],
      default: TYPE_FREE,
    }
  },
}, {
  strict: true, // prevents `store` from being saved
  minimize: false, // allows empty objects (like request) to come out
  toObject: {
    transform: function (doc, ret) {
      ret.store = JSON.parse(doc.storeJson);
    }
  },

});

schema.pre('save', function (next) { // not => to keep `this`
  this.updated = Date.now();

  // handle migration
  if (typeof this.store !== 'string' && this.store) {
    try {
      this.storeJson = JSON.stringify(this.store);
    } catch (e) {
      console.error('save.pre: publicId: %s', doc.publicId, this.store, e.stack);
    }
    // delete this.store;
  }

  next();
});

schema.post('findOne', doc => {
  if (doc) {
    if (typeof doc.storeJson === 'string') {
      try {
        doc.store = JSON.parse(doc.storeJson);
      } catch (e) {
        console.error('findOne.post: publicId: %s', doc.publicId, e.stack);
        doc.store = {};
      }
    } else {
      doc.store = {};
    }
  }
});

schema.methods.generateBearer = function (expiresIn = '1 hour') {
  const token = jwt.sign({ id: this.publicId }, this.apikey, { expiresIn });
  return token;
}

schema.methods.dirty = function (key = 'storeJson') {
  this.markModified(key);

  // calling markModified seems to cause the entire document to bail
  // this.markModified('requests');
  // this.markModified('public');
  // return this;
};

schema.statics.findOrCreate = ({ githubId = null, email } = {}, data) => {
  return User.findOne({ githubId }).then(user => {
    if (user) {
      if (data.store) {
        user.store = data.store;
      }
      return user.save();
    }

    const body = {
      email,
      githubId,
      store: data.store || null,
      apikey: uuid.v4(),
      username: data.login,
    }

    user = new User(body);

    // note: this happens after user creation because `store` is a virtual
    if (!body.store) {
      user.store = {
        gettingStarted: `check out the *help*, and try 'curl ${process.env.HOST}/${body.username} -H "authorization: token ${body.apikey}"'`,
        urls: ['help', 'me', 'logout'].map(_ => `${process.env.HOST}/_/${_}`),
      };
    }

    return user.save();
  }).catch(e => {
    console.log('failed', e);
    throw e;
  });
};

const User = module.exports = mongoose.model('user', schema);
