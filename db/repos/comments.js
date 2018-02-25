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
           resume_id: values.resume_id,
           author: values.author,
           body: values.body,
           date: values.date,
        });
    }
    
    find(resume_id) {
        return this.db.any(sql.find, {
            resume_id: resume_id,
        });
    }
}

module.exports = CommentsRepository;