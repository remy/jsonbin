const mongoose = require('./index');
const Archive = require('./archive');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const shortid = require('shortid');
const TYPE_FREE = 'FREE';
const TYPE_SUPPORTER = 'SUPPORTER';
const TYPE_PRO = 'PRO';

const STORE_LIMIT = 1000000;

const schema = mongoose.Schema(
  {
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
      default: () => `AC${shortid.generate()}`,
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
      default: Date.now,
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
      },
    },
    archives: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'archive',
      },
    ],
    githubId: String,
  },
  {
    strict: true, // prevents `store` from being saved
    minimize: false, // allows empty objects (like request) to come out
    toObject: {
      transform: function(doc, ret) {
        if (doc.storeJson.length > STORE_LIMIT) {
          throw new Error(
            'Your JSON store is too large and can cause memory heap allocations failures. Please get in touch via the github issues to have your store manually reduced.'
          );
        }
        delete ret.archives;
        delete ret.__v;
        delete ret._id;
        ret.store = JSON.parse(doc.storeJson);
      },
    },
  }
);

// no idea why, but this is called twice…
schema.pre('save', function(next) {
  // not => to keep `this`
  this.updated = Date.now();
  const storeJson = this.storeJson || null;

  // handle migration
  if (typeof this.store !== 'string' && this.store) {
    try {
      this.storeJson = JSON.stringify(this.store);
    } catch (e) {
      console.error(
        'save.pre: publicId: %s',
        this.publicId,
        this.store,
        e.stack
      );
    }
    // delete this.store;
  }

  if (storeJson && storeJson !== this.storeJson) {
    if (this.accountType.name !== TYPE_FREE) {
      const archive = new Archive({
        storeJson,
        ownerId: this.publicId,
        method: this.__meta.method,
        path: this.__meta.path,
      });
      archive.save();
      // this is nonsense: http://stackoverflow.com/a/36871152
      // but for some reason it was making two records :-\
      this.archives = this.archives.concat([archive._id]);
    }
  }

  delete this.__meta;

  next();
});

schema.post('findOne', (doc, next) => {
  if (doc) {
    if (typeof doc.storeJson === 'string') {
      if (doc.storeJson.length > STORE_LIMIT) {
        return next(
          new Error(
            `The JSON store for "${
              doc.username
            }" is too large and can cause memory heap allocations failures. Please get in touch via the github issues to have your store manually reduced.`
          )
        );
      }
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
  next();
});

schema.methods.generateBearer = function(
  { path = '', expiresIn = '1 hour' } = {}
) {
  return jwt.sign({ id: this.publicId, path }, this.apikey, { expiresIn });
};

schema.methods.dirty = function(key = 'storeJson', meta) {
  this.markModified(key);

  if (meta) this.__meta = meta;
};

schema.statics.types = {
  TYPE_FREE,
  TYPE_SUPPORTER,
  TYPE_PRO,
};

schema.statics.findOrCreate = ({ githubId = null, email } = {}, data) => {
  githubId = githubId.toString(); // ensure this is a string
  return User.findOne({ githubId })
    .then(user => {
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
      };

      user = new User(body);

      // note: this happens after user creation because `store` is a virtual
      if (!body.store) {
        user.store = {
          gettingStarted: `check out the *help*, and try 'curl ${
            process.env.HOST
          }/me -H "authorization: token ${body.apikey}"'`,
          urls: ['help', 'me', 'logout'].map(_ => `${process.env.HOST}/_/${_}`),
        };
      }

      return user.save();
    })
    .catch(e => {
      console.log('failed', JSON.stringify({ email, githubId }), e);
      throw new Error(e.message);
    });
};

const User = (module.exports = mongoose.model('user', schema));
