const urlToArray = url => url.split('/').slice(1).filter(Boolean);

const urlToPath = url => {
  const path = urlToArray(url).map(path => {
    if (path.includes('.') === false) {
      return `.${path}`;
    }

    return `["${path.replace(/"/g, '\\"')}"]`;
  }).join('').replace(/^\./, ''); // trim the first dot

  return path;
};

const partialMatch = (ask, against) => {
  return ask === against || ask.startsWith(`${against}/`) || ask.startsWith(`${against}.`) || ask.startsWith(`${against}[`)
};

const noCache = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
};

module.exports = {
  urlToArray,
  urlToPath,
  noCache,
  partialMatch,
};
