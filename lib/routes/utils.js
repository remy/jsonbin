const urlToArray = url => url.split('/').slice(1).filter(Boolean);
const urlToPath = url => {
  const path = urlToArray(url).map(path => {
    if (path.includes('.') === false) {
      return `.${path}`;
    }

    return `["${path.replace(/"/g, '\\"')}"]`;
  }).join('').replace(/^\./, ''); // trim the first dot

  return path;
}

function noCache(req, res, next) {
  res.setHeader('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
}

function cors(req, res, next) {
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}

module.exports = {
  urlToArray,
  urlToPath,
  noCache,
  cors,
};
