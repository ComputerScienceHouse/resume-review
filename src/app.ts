import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'path';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import passport, { type Profile } from 'passport';
import session from 'express-session';
import OpenIDConnectStrategy, { type VerifyCallback } from 'passport-openidconnect';

import config from './config.js';
import index from './routes/index.js';
import resumes from './routes/resumes.js';
import upload from './routes/upload.js';
import comment from './routes/comment.js';
// importing this module will schedule the job that communicates with ResumeBot
// This was never used in the original code ~Nick
// import resumeBot from './slackbot';

const app = express();

// view engine setup
app.set('views', path.join(process.cwd(), 'views'));
app.set('view engine', 'pug');

app.use(logger('combined'));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: config.auth.session_secret,
    saveUninitialized: true,
    resave: true,
}));

passport.use(new OpenIDConnectStrategy(
    {
        issuer: 'https://sso.csh.rit.edu/auth/realms/csh',
        authorizationURL: 'https://sso.csh.rit.edu/auth/realms/csh/protocol/openid-connect/auth',
        tokenURL: 'https://sso.csh.rit.edu/auth/realms/csh/protocol/openid-connect/token',
        userInfoURL: 'https://sso.csh.rit.edu/auth/realms/csh/protocol/openid-connect/userinfo',
        clientID: config.auth.client_id,
        clientSecret: config.auth.client_secret,
        callbackURL: config.auth.callback_url,
    },
    function (_issuer: string, profile: Profile, cb: VerifyCallback) {
        return cb(null, profile);
    }
));

const userFunct = (user: Express.User, cb: VerifyCallback) => cb(null, user);
passport.serializeUser(userFunct);
passport.deserializeUser(userFunct);

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth',
    passport.authenticate('openidconnect'));

app.get('/auth/callback',
    passport.authenticate('openidconnect', { failureRedirect: '/auth' }),
    function (_req, res) {
        res.redirect('/');
    });

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
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
app.use(function (_req, _res, next) {
    var err = new AppError('Not Found', 404);
    next(err);
});

// error handler
app.use(function (err: AppError, req: Request, res: Response, _next: NextFunction) {
    // set locals, only providing error in development
    res.locals.message = JSON.stringify(err.message);
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(config.port);

export default app;

class AppError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;

        // Set the prototype explicitly (required when extending built-in classes in TS)
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
