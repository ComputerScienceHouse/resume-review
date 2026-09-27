import type { IDatabase } from 'pg-promise';
import type { Resume } from '../../types.js';
import _sql from '../sql/index.js';
import type pg from 'pg-promise/typescript/pg-subset.js';
import type { Ext } from '../index.js';

const sql = _sql.resumes;

class ResumesRepository {
    db: IDatabase<Ext, pg.IClient>;

    constructor(db: IDatabase<Ext, pg.IClient>, _pgp?: unknown) {
        this.db = db;
       }

    create() {
        return this.db.none(sql.create);
    }

    drop() {
        return this.db.none(sql.drop);
    }

    empty() {
        return this.db.none(sql.empty);
    }

    add(values: Resume) {
        return this.db.one(sql.add, {
           id: values.id,
           author: values.author,
           filename: values.filename,
           date: values.date,
        });
    }

    all() {
        return this.db.any('select * from resumes order by date desc, filename desc');
    }

    newestByAuthor() {
        return this.db.any(sql.newestByAuthor);
    }

    find(id: string) {
        return this.db.oneOrNone(sql.find, {
            id: id,
        });
    }

    findByAuthor(author: string) {
        return this.db.any(sql.findByAuthor, {
            author,
        });
    }

    delete(id: string) {
        return this.db.none(sql.delete, {
            id: id,
        });
    }

    /**
    Fetches a list of users that posted a resume in the last 24 hours
    */
    fetchRecentUploders() {
        return this.db.any(sql.dailyDigest);
    }

}

export default ResumesRepository;
