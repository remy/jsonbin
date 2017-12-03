const crypto = require('crypto');
const marked = require('8fold-marked');
const hbs = require('express-hbs');
const moment = require('moment');

module.exports = hbs;

const md5 = data =>
  crypto
    .createHash('md5')
    .update(data)
    .digest('hex');

hbs.registerHelper('options', function(selected, ...data) {
  data.pop();
  let options = '';
  for (const key of data) {
    if (selected === key) {
      options += `<option selected value="${key}">${key}</option>`;
    } else {
      options += `<option value="${key}">${key}</option>`;
    }
  }
  return new hbs.SafeString(options);
});

hbs.registerHelper('if_empty', function(data, options) {
  const keys = Object.keys(data);
  return keys.length === 0 ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper('marked', function(options) {
  return marked(options.fn(this));
});

hbs.registerHelper('avatar', (account, ...rest) => {
  rest.pop();
  let size = 32;
  if (rest.length) {
    size = rest.shift();
  }

  let img = null;

  if (account.logo || account.accountData.email) {
    const url =
      account.logo ||
      `https://www.gravatar.com/avatar/${md5(
        account.accountData.email
      )}?s=${size * 2}`;
    img = `<img width="${size}" class="avatar circle" src="${url}">`;
  }

  if (!img) {
    img =
      '<img width="${size}" src="/img/tmp-avatar.svg" class="circle green tmp-avatar">';
  }

  return new hbs.SafeString(img);
});

hbs.registerHelper('gravatar', (email, ...rest) => {
  rest.pop();
  let size = 64;
  if (rest.length) {
    size = rest.shift();
  }
  return 'https://www.gravatar.com/avatar/' + md5(email) + '?s=' + size;
});

hbs.registerHelper('tomorrow', f =>
  moment()
    .utc()
    .add(1, 'day')
    .format(f)
);
hbs.registerHelper('upper', s => s.toUpperCase());
hbs.registerHelper('lower', s => s.toLowerCase());

hbs.registerHelper('moment-format', (date, format) => {
  if (typeof format !== 'string') {
    format = date;
    date = new Date();
  }
  return moment.utc(date).format(format);
});

hbs.registerHelper('urlFormat', (url, ...args) => {
  args.pop();
  if (!url.includes('?')) {
    url += '?';
  } else {
    url += '&';
  }
  return url + args.join('&');
});

// removes the "in" text, just number and unit
hbs.registerHelper('momentFromNow', from => {
  if (from > Date.now()) {
    // future?!
    return 'no days';
  }
  return moment.utc(from).fromNow();
});

hbs.registerHelper('dump', data => JSON.stringify(data, null, 2));

hbs.registerHelper('sort', (data, prop, options) => {
  return options.fn(
    data.sort((a, b) => {
      return a[prop] < b[prop] ? -1 : 1;
    })
  );
});

hbs.registerHelper('firstNonFalse', (data, options) => {
  return options.fn(data.filter(Boolean).shift());
});

hbs.registerHelper('if_eq', (a, b, opts) => {
  return a === b ? opts.fn(this) : opts.inverse(this);
});

hbs.registerHelper('if_all', function() {
  // important: not an arrow fn
  const args = [].slice.call(arguments);
  const opts = args.pop();

  return args.every(v => !!v) ? opts.fn(this) : opts.inverse(this);
});

hbs.registerHelper('if_any', (...args) => {
  // important: not an arrow fn
  const opts = args.pop();

  return args.some(v => !!v) ? opts.fn(this) : opts.inverse(this);
});

hbs.registerHelper('unless_eq', (a, b, opts) => {
  return a !== b ? opts.fn(this) : opts.inverse(this);
});

hbs.registerHelper('ifCond', (v1, operator, v2, options) => {
  switch (operator) {
    case '==': {
      return v1 == v2
        ? options.fn(this) // jshint ignore:line
        : options.inverse(this);
    }
    case '===': {
      return v1 === v2 ? options.fn(this) : options.inverse(this);
    }
    case '<': {
      return v1 < v2 ? options.fn(this) : options.inverse(this);
    }
    case '<=': {
      return v1 <= v2 ? options.fn(this) : options.inverse(this);
    }
    case '>': {
      return v1 > v2 ? options.fn(this) : options.inverse(this);
    }
    case '>=': {
      return v1 >= v2 ? options.fn(this) : options.inverse(this);
    }
    case '&&': {
      return v1 && v2 ? options.fn(this) : options.inverse(this);
    }
    case '||': {
      return v1 || v2 ? options.fn(this) : options.inverse(this);
    }
    default: {
      return options.inverse(this);
    }
  }
});

/**
 * {{#feature user 'alpha'}}
 *   <!-- here be the new stuff -->
 * {{else}}
 *   <!--- unentitled users get this stuff -->
 * {{/feature}}
 */
// hbs.registerHelper('feature', function (user, flag, opts) {
//   // the convention is that the feature receives a request object
//   // that will contain the user as a property, so I'm fleshing it out here.
//   return (features(flag, { user: user })) ? opts.fn(this) : opts.inverse(this);
// });

hbs.registerHelper({
  eq: function(v1, v2) {
    return v1 === v2;
  },
  ne: function(v1, v2) {
    return v1 !== v2;
  },
  lt: function(v1, v2) {
    return v1 < v2;
  },
  gt: function(v1, v2) {
    return v1 > v2;
  },
  lte: function(v1, v2) {
    return v1 <= v2;
  },
  gte: function(v1, v2) {
    return v1 >= v2;
  },
  and: function(v1, v2) {
    return v1 && v2;
  },
  or: function(v1, v2) {
    return v1 || v2;
  },
  not: function(v) {
    return !v;
  },
});

hbs.registerHelper('encode', encodeURIComponent);

hbs.registerHelper('json', JSON.stringify.bind(JSON));

hbs.registerHelper('math', function(lvalue, operator, rvalue) {
  lvalue = parseFloat(lvalue);
  rvalue = parseFloat(rvalue);

  return {
    '+': lvalue + rvalue,
    '-': lvalue - rvalue,
    '*': lvalue * rvalue,
    '/': lvalue / rvalue,
    '%': lvalue % rvalue,
  }[operator];
});

// usage: {{pluralize collection.length 'quiz' 'quizzes'}}
hbs.registerHelper('pluralize', function(number, single, plural) {
  return number === 1 ? single : plural;
});

hbs.registerHelper('lower', text => text.toLowerCase());
