// 3rd party
const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession);

// ours
const config = require('./config');
const passport = require('./passport');
const mongoose = require('./db');
const hbs = require('./hbs');

const app = express();
app.disable('x-powered-by');

var render = hbs.express3({
  extname: '.html',
  defaultLayout: __dirname + '/../views/layout.html',
  partialsDir: [__dirname + '/../views/partials'],
});
app.engine('html', render);
app.engine('svg', render);
app.set('views', __dirname + '/../views');
app.set('view engine', 'html');
app.set('json spaces', 2);

app.use('/_/log', require('inline-log')({ limit: 50 }))
app.use('/_', express.static(__dirname + '/../public'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// custom body parser when there's no content-type
app.use((req, res, next) => {
  const body = req.body && Object.keys(req.body).length;
  const mime = req.get('content-type');

  // these two are already handled
  if (mime === 'application/json' || mime === 'application/x-www-form-urlencoded') {
    return next();
  }
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && !body) {
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
});

app.use(expressSession({
  resave: true,
  secret: process.env.SESSION_SECRET,
  name: 'id',
  httpOnly: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 60 * 60 * 24 * 60 * 1000, // milliseconds
  },
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', require('./routes')); // mount the router

app.locals.production = config.NODE_ENV === 'production';
app.locals.analytics = config.ANALYTICS;

const server = app.listen(process.env.PORT || 8000, (...rest) => {
  if (process.env.NODE_ENV === 'dev')
    console.log(`listening on http://localhost:${server.address().port} @ ${new Date().toJSON()}`);
});
