import type { IDatabase } from 'pg-promise';
import _sql from '../sql/index.js';
import type pg from 'pg-promise/typescript/pg-subset.js';
import type { Comment } from '../../types.js';
import type { Ext } from '../index.js';

const sql = _sql.comments;

class CommentsRepository {
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

    add(values: Comment) {
        return this.db.one(sql.add, {
            id: values.id,
            parent_id: values.parent_id,
            author: values.author,
            body: values.body,
            date: values.date,
        });
    }

    find(id: string) {
        return this.db.oneOrNone(sql.find, {
            id: id,
        });
    }

    findByParent(parent_id: string) {
        return this.db.any(sql.findByParent, {
            parent_id: parent_id,
        });
    }

    delete(id: string) {
        return this.db.result(sql.delete, {
            id: id,
        });
    }
}

export default CommentsRepository;
