import express, { type NextFunction, type Request, type Response } from "express";
import passport from "passport";
const router = express.Router();

router.get('/', passport.authenticate('openidconnect'));

router.get('/callback',
    passport.authenticate('openidconnect', { failureRedirect: '/' }),
    function(_req, res, _next) {
        res.redirect('/');
    }
);

function auth(req: Request, res: Response, next: NextFunction) {
    if (req.user) {
        next();
    } else {
        res.redirect('/')
    }
}

module.exports = { router: router, auth: auth };
