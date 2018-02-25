const config = require('../config');
const promise = require('bluebird');

const repos = {
    resumes: require('./repos/resumes'),
    comments: require('./repos/comments'),
};

const options = {
    promiseLib: promise,
    extend: (obj, dc) => {
        obj.resumes = new repos.resumes(obj, pgp);
        obj.comments = new repos.comments(obj, pgp);
    }
}

const props = {
    host: 'postgres.csh.rit.edu',
    database: config.db.name,
    user: config.db.username,
    password: config.db.password,
    ssl: true,
};

const pgp = require('pg-promise')(options);

const db = pgp(props);

module.exports = db;
