const urlToArray = url => url.split('/').slice(1).filter(Boolean);
const urlToPath = url => urlToArray(url).join('.');

function noCache(req, res, next) {
  res.setHeader('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
}

module.exports = {
  urlToArray,
  urlToPath,
  noCache,
};
