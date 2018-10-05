const sql = require('../sql').resumes;

class ResumesRepository {
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
           author: values.author,
           filename: values.filename,
           date: values.date,
        });
    }
    
    all() {
        return this.db.any('select * from resumes order by date desc, filename desc');
    }
    
    find(id) {
        return this.db.oneOrNone(sql.find, {
            id: id,
        });
    }

    findByAuthor(author) {
        return this.db.any(sql.findByAuthor, {
            author,
        });
    }

    delete(id) {
        return this.db.none(sql.delete, {
            id: id,
        });
    }
}

module.exports = ResumesRepository;