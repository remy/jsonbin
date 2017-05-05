const onHeaders = require('on-headers');
const undefsafe = require('undefsafe');

const start = timings => key => {
  timings[key] = {
    start: process.hrtime(),
  };

  return timings[key].start;
};

const end = timings => key => {
  if (!timings[key] || !timings[key].start) {
    return;
  }

  timings[key].end = process.hrtime(timings[key].start);
  timings[key].delta = (timings[key].end[1]/1000000).toFixed(2);

  return timings[key].delta;
}

module.exports = (req, res, next) => {
  const timings = {};

  res.locals.timings = {
    start: start(timings),
    end: end(timings),
  };

  res.locals.timings.start('Request');

  onHeaders(res, () => {
    const mapping = Object.keys(timings).map((key, i) => {
      const delta = timings[key].delta || end(timings)(key);
      return `${i}=${delta}; "${key}"`
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
