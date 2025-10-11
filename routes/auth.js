import express from "express"
const router = express.Router();

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