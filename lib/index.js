// 3rd party
const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession);
const favicon = require('serve-favicon');
const logger = require('morgan');

// ours
const config = require('./config');
if (process.env.LOGGLY_TOKEN) {
  require('std-loggly')({
    token: process.env.LOGGLY_TOKEN,
    subdomain: process.env.LOGGLY_DOMAIN,
    tags: [`env-${process.env.NODE_ENV}`, `name-${process.env.npm_package_name}`]
  });
}
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

app.use((req, res, next) => {
  const drop = [
    '/wp-login.php',
    '/wp-includes/'
  ];

  if (drop.includes(req.url)) {
    return res.status(204).end();
  }
  next();
});

app.use(favicon(__dirname + '/../public/favicon.ico'));
app.use('/_', express.static(__dirname + '/../public')); // don't log static

if (process.env.NODE_ENV !== 'test') {
  logger.token('auth', (req, res) => req.headers.authorization)
  app.use(logger(':status :method :url :auth :response-time ms', {
    skip: (req, res) => {
      if (res.statusCode < 400) {
        return true;
      }
      if (res.statusCode === 404) {
        return true;
      }

      return false;
    }
  }));
}
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true,
  verify: (req, res, buf, enc) => {
    const s = buf.toString();
    req.rawBody = s;
  }
}));

// custom body parser when there's no content-type
app.use(require('./custom-body-parser'));

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
/* error handler */
app.use(require('./routes/error'));
app.use('/', require('./routes')); // mount the router
app.use(require('./routes/error'));

app.locals.production = config.NODE_ENV === 'production';
app.locals.analytics = config.ANALYTICS;
app.locals.env = process.env;

const server = app.listen(process.env.PORT || 8000, (...rest) => {
  if (process.env.NODE_ENV === 'dev')
    console.log(`listening on http://localhost:${server.address().port} @ ${new Date().toJSON()}`);
});
