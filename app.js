import express from 'express';
import path from 'path';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import passport from 'passport';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { Strategy as OIDCStrategy } from 'passport-openidconnect';

import config from './config.js';
import index from './routes/index.js';
import resumes from './routes/resumes.js';
import upload from './routes/upload.js';
import comment from './routes/comment.js';

// https://flaviocopes.com/fix-dirname-not-defined-es-module-scope/
// __dirname isn't defined in ES Modules and this code was initially written before ES Modules were a thing
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('combined'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: config.auth.session_secret,
  saveUninitialized: true,
  resave: true,
}));

passport.use(new OIDCStrategy({
    issuer: 'https://sso.csh.rit.edu/auth/realms/csh',
    authorizationURL: 'https://sso.csh.rit.edu/auth/realms/csh/protocol/openid-connect/auth',
    tokenURL: 'https://sso.csh.rit.edu/auth/realms/csh/protocol/openid-connect/token',
    userInfoURL: 'https://sso.csh.rit.edu/auth/realms/csh/protocol/openid-connect/userinfo',
    clientID: config.auth.client_id,
    clientSecret: config.auth.client_secret,
    callbackURL: config.auth.callback_url,
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
  }));

const userFunct = (user, cb) => cb(null, user);
passport.serializeUser(userFunct);
passport.deserializeUser(userFunct);

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth',
  passport.authenticate('openidconnect'));

app.get('/auth/callback',
  passport.authenticate('openidconnect', { failureRedirect: '/auth' }),
  function(req, res) {
    res.redirect('/');
  });

const requireAuth = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect('/auth');
  }
};

app.use('/', requireAuth, index);
app.use('/resumes', requireAuth, resumes);
app.use('/upload', requireAuth, upload);
app.use('/comment', requireAuth, comment);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = JSON.stringify(err.message);
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(config.port);

export default app;
