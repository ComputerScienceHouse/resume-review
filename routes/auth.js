var express = require('express');
var router = express.Router();
var passport = require('passport');
const config = require('../config');

var Strategy = require('passport-openidconnect').Strategy;

passport.use(new Strategy({
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

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


router.use(require('morgan')('combined'));
router.use(require('cookie-parser')());
router.use(require('body-parser').urlencoded({ extended: true }));
router.use(require('express-session')({ secret: config.auth.session_secret, resave: true, saveUninitialized: true }));

router.use(passport.initialize());
router.use(passport.session());

router.get('/',
  passport.authenticate('openidconnect'));

router.get('/callback',
  passport.authenticate('openidconnect', { failureRedirect: '/' }),
  function(req, res, next) {
    res.redirect('/');
  });

function auth(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/')
  }
}

module.exports = {router: router, auth: auth};