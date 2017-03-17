const onHeaders = require('on-headers');
const undefsafe = require('undefsafe');

const start = timings => opts => {
  if (typeof opts === 'string') {
    opts = { label: opts, key: opts.toLowerCase(), };
  }

  const { label, key } = opts;
  timings[key] = {
    label,
    start: process.hrtime(),
  };

  return timings[key].start;
};

const end = timings => opts => {
  if (typeof opts === 'string') {
    opts = { label: opts, key: opts.toLowerCase(), };
  }

  const { label, key } = opts;

  if (!timings[key] || !timings[key].start) {
    return;
  }

  timings[key].end = process.hrtime(timings[key].start);
  timings[key].delta = (timings[key].end[1]/1000000).toFixed(2);

  return timings[key].delta;
}

module.exports = (req, res, next) => {
  const timings = {
    req: {
      label: 'Request',
      start: process.hrtime(),
    }
  };

  res.locals.timings = {
    start: start(timings),
    end: end(timings),
  };

  onHeaders(res, () => {
    const mapping = Object.keys(timings).map((key, i) => {
      let { delta, label } = timings[key];
      if (!delta) {
        delta = end(timings)({ key, label });
      }
      return `${i}=${delta}; "${label}"`
    }).join(', ');

    res.setHeader('Server-Timing', mapping);
  });

  next();
};

module.exports.start = opts => (req, res, next) => {
  res.locals.timings.start(opts);
  next();
};

module.exports.end = opts => (req, res, next) => {
  res.locals.timings.end(opts);
  next();
};
