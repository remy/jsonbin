module.exports = (req, res, next) => {
  const body = req.body && Object.keys(req.body).length;
  const mime = req.get('content-type');

  if (mime === 'application/json') {
    return next();
  }

  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    // this is the main use case when JSON is posted
    // but is under this mime (typically from curl)
    // this also handles a bare body payload
    if (mime === 'application/x-www-form-urlencoded') {
      let key = req.rawBody;
      const rawBody = req.rawBody;
      try {
        const raw = JSON.parse(req.rawBody);

        // because jsfuck… when `[]` is posted, the
        // req.body is transformed into `{ "0": "" }`
        // because if you +JSON.parse('[]')===0
        // I'm not sure where this happens in the
        // body parser (from express), but it does happen!
        key = +raw;
        if (isNaN(key)) {
          key = raw;
        }
        req.rawBody = raw;
      } catch (e) {}

      if (body && (req.body[key] === '' || req.body[rawBody] === '')) {
        req.body = req.rawBody;
      }
      return next();
    }

    if (body) {
      return next();
    }

    let data = '';
    req.setEncoding('utf8');
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      try {
        req.body = JSON.parse(data);
      } catch (e) {
        req.body = data;
      }
      next();
    });
  } else {
    next();
  }
}
