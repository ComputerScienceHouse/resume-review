const sql = require('../sql').comments;

class CommentsRepository {
    constructor(db, pgp) {
        this.db = db;
        this.pgp = pgp;
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

    add(values) {
        return this.db.one(sql.add, {
            id: values.id,
            parent_id: values.parent_id,
            author: values.author,
            body: values.body,
            date: values.date,
        });
    }

    find(id) {
        return this.db.oneOrNone(sql.find, {
            id: id,
        });
    }

    findByParent(parent_id) {
        return this.db.any(sql.findByParent, {
            parent_id: parent_id,
        });
    }

    delete(id) {
        return this.db.result(sql.delete, {
            id: id,
        });
    }
}

module.exports = CommentsRepository;