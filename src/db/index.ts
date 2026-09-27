import pgPromise, { type IDatabase, type IInitOptions } from 'pg-promise';
import pg from 'pg-promise/typescript/pg-subset.js';

import resumes from './repos/resumes.js';
import comments from './repos/comments.js';
import config from '../config.js';

export type Ext = {
    resumes: resumes;
    comments: comments;
};

const options: IInitOptions<Ext, pg.IClient> = {
    extend: (obj: IDatabase<Ext, pg.IClient> & Ext, _dc: IDatabase<Ext, pg.IClient>) => {
        obj.resumes = new resumes(obj, pgp);
        obj.comments = new comments(obj, pgp);
     }
}

const props = {
    host: 'postgres.csh.rit.edu',
    database: config.db.name,
    user: config.db.username,
    password: config.db.password,
    ssl: config.disable_ssl == "true" ? {
        rejectUnauthorized: false,
    } : true,
};

const pgp = pgPromise(options);

const db = pgp(props);

export default db;
